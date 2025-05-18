import type { CoreImageData } from '../../types';

/**
 * Uploads CoreImageData to a new GPUTexture.
 *
 * @param device - The GPUDevice.
 * @param imageData - The CoreImageData to upload.
 * @param usage - Optional GPUTextureUsageFlags for the new texture.
 * @returns The created GPUTexture.
 */
export function uploadCoreImageDataToTexture(
    device: GPUDevice,
    imageData: CoreImageData,
    usage: GPUTextureUsageFlags = GPUTextureUsage.TEXTURE_BINDING |
        GPUTextureUsage.COPY_DST |
        GPUTextureUsage.RENDER_ATTACHMENT // Default suitable for source & processing
): GPUTexture {
    // TODO: Add mapping from CoreImageData.format to GPUTextureFormat if necessary
    // For now, assume imageData.format is compatible with 'rgba8unorm' or is 'rgba8unorm'
    const textureFormat: GPUTextureFormat = 'rgba8unorm'; // Placeholder

    const texture = device.createTexture({
        size: [imageData.width, imageData.height, 1],
        format: textureFormat,
        usage: usage,
    });

    // Ensure data is Uint8ClampedArray or ArrayBuffer as per CoreImageData definition
    const sourceData: BufferSource = (imageData.data instanceof ArrayBuffer)
        ? imageData.data
        : (imageData.data as Uint8ClampedArray).buffer; // Get ArrayBuffer from Uint8ClampedArray

    // For rgba8unorm, 4 bytes per pixel.
    const bytesPerPixel = 4;
    const bytesPerRow = imageData.width * bytesPerPixel;
    // const alignedBytesPerRow = Math.ceil(bytesPerRow / 256) * 256; // Ensure 256-byte alignment if using copyBufferToTexture
    // writeTexture does not require manual alignment for bytesPerRow in dataLayout if the source data itself is tightly packed.

    device.queue.writeTexture(
        { texture: texture },
        sourceData,
        {
            // buffer:stagingBuffer, // Not needed if sourceData is directly ArrayBuffer/TypedArray buffer
            offset: 0,
            bytesPerRow: bytesPerRow, // For tightly packed data from canvas/ImageBitmap this should be correct
            rowsPerImage: imageData.height,
        },
        { width: imageData.width, height: imageData.height, depthOrArrayLayers: 1 }
    );

    return texture;
}

/**
 * Reads back data from a GPUTexture to CoreImageData.
 *
 * @param device - The GPUDevice.
 * @param sourceTexture - The GPUTexture to read from.
 * @param width - The width of the texture.
 * @param height - The height of the texture.
 * @returns A Promise resolving to CoreImageData containing the texture data.
 */
export async function readbackGpuTextureToCoreImageData(
    device: GPUDevice,
    sourceTexture: GPUTexture,
    width: number,
    height: number
): Promise<CoreImageData> {
    // Assuming texture format is 'rgba8unorm' for now (4 bytes per pixel)
    // TODO: Make this adaptable to sourceTexture.format
    const bytesPerPixel = 4;
    const unalignedBytesPerRow = width * bytesPerPixel;
    const alignedBytesPerRow = Math.ceil(unalignedBytesPerRow / 256) * 256;

    const readbackBufferSize = alignedBytesPerRow * height;

    const readbackBuffer = device.createBuffer({
        size: readbackBufferSize,
        usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
        label: 'textureReadbackBuffer',
    });

    const commandEncoder = device.createCommandEncoder({
        label: 'textureReadbackEncoder',
    });

    commandEncoder.copyTextureToBuffer(
        { texture: sourceTexture, mipLevel: 0, origin: { x: 0, y: 0, z: 0 } },
        { buffer: readbackBuffer, bytesPerRow: alignedBytesPerRow, rowsPerImage: height },
        { width: width, height: height, depthOrArrayLayers: 1 }
    );

    device.queue.submit([commandEncoder.finish()]);

    await readbackBuffer.mapAsync(GPUMapMode.READ, 0, readbackBufferSize);
    const mappedRange = readbackBuffer.getMappedRange(0, readbackBufferSize);

    // Create a copy of the data, as the mappedRange becomes invalid after unmap
    const pixelDataArrayBuffer = mappedRange.slice(0); // slice(0) creates a copy

    readbackBuffer.unmap();
    readbackBuffer.destroy();

    // If the data was padded for alignment, we might need to strip padding here
    // or ensure the consumer knows about alignedBytesPerRow vs unalignedBytesPerRow.
    // For CoreImageData, we typically want tightly packed data.
    let finalPixelData: Uint8ClampedArray;
    if (alignedBytesPerRow === unalignedBytesPerRow) {
        finalPixelData = new Uint8ClampedArray(pixelDataArrayBuffer);
    } else {
        // Data has row padding, need to copy row by row to a new tightly packed buffer
        finalPixelData = new Uint8ClampedArray(unalignedBytesPerRow * height);
        for (let y = 0; y < height; y++) {
            const sourceOffset = y * alignedBytesPerRow;
            const destinationOffset = y * unalignedBytesPerRow;
            const rowData = new Uint8ClampedArray(pixelDataArrayBuffer, sourceOffset, unalignedBytesPerRow);
            finalPixelData.set(rowData, destinationOffset);
        }
    }

    return {
        data: finalPixelData,
        width: width,
        height: height,
        format: sourceTexture.format, // Use the actual format of the source texture
    };
}

// Future utility functions related to WebGPU textures can be added here:
// - createEmptyGpuTexture
// - etc. 