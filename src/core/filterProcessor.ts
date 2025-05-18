import type { CoreImageData, FilterOperation } from '../types';
import {
    uploadCoreImageDataToTexture,
    readbackGpuTextureToCoreImageData,
} from '../renderers/webgpu/webgpuTextureUtils';
import {
    createGpuRenderPipeline,
    createGpuBindGroup,
    executeGpuRenderPass,
} from '../renderers/webgpu/webgpuPipelineUtils';

// Import shaders directly as raw strings (Vite specific)
import grayscaleShaderWGSL from '../renderers/webgpu/shaders/grayscale.wgsl?raw';

/**
 * Applies a series of filter operations to image data.
 * Supports CPU-based grayscale and will be extended for GPU processing.
 *
 * @param inputImageData - The core image data to process.
 * @param operations - A single filter operation or an array of operations.
 * @param device - Optional GPUDevice to enable WebGPU processing.
 * @returns A promise that resolves to the processed CoreImageData.
 */
export async function applyFilters(
    inputImageData: CoreImageData,
    operations: FilterOperation | FilterOperation[],
    device?: GPUDevice // Optional device for GPU path
): Promise<CoreImageData> {
    const opsArray = Array.isArray(operations) ? operations : [operations];

    if (device && opsArray.length === 1 && opsArray[0].name === 'grayscale') {
        // GPU Path for a single grayscale filter (initial implementation)
        console.log('Using GPU path for grayscale filter.');
        let sourceTexture: GPUTexture | undefined;
        let outputTexture: GPUTexture | undefined;
        let pipeline: GPURenderPipeline | undefined;
        let bindGroup: GPUBindGroup | undefined;
        let sampler: GPUSampler | undefined;

        try {
            sampler = device.createSampler({ magFilter: 'linear', minFilter: 'linear' });
            sourceTexture = uploadCoreImageDataToTexture(device, inputImageData);

            // For single pass, output can be a new texture with same properties
            outputTexture = device.createTexture({
                size: [inputImageData.width, inputImageData.height, 1],
                format: sourceTexture.format, // Output format same as source for this filter
                usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC,
                label: 'grayscaleOutputTexture',
            });

            const presentationFormat = sourceTexture.format; // Output format for pipeline
            pipeline = createGpuRenderPipeline(
                device,
                'grayscale',
                grayscaleShaderWGSL,
                presentationFormat
            );

            bindGroup = createGpuBindGroup(
                device,
                pipeline,
                sampler,
                sourceTexture.createView()
            );

            executeGpuRenderPass(
                device,
                pipeline,
                bindGroup,
                outputTexture.createView()
            );

            // Read back the result from outputTexture
            const resultImageData = await readbackGpuTextureToCoreImageData(
                device,
                outputTexture,
                inputImageData.width,
                inputImageData.height
            );
            return resultImageData;

        } catch (error) {
            console.error('Error during GPU processing for grayscale filter:', error);
            throw error; // Re-throw to allow higher-level error handling
        } finally {
            // Clean up GPU resources
            sourceTexture?.destroy();
            outputTexture?.destroy();
            // Note: pipeline and bindGroup are not destroyable GPU objects themselves.
            // Sampler could be destroyed if not reused, but often they are.
            // For simplicity, not destroying sampler here, could be cached/managed elsewhere.
        }
    } else {
        // CPU Path (existing logic)
        console.log('Using CPU path for filters.');
        let currentPixelData = Uint8ClampedArray.from(inputImageData.data as Uint8ClampedArray);
        const { width, height } = inputImageData;

        for (const operation of opsArray) {
            if (operation.name === 'grayscale') {
                for (let i = 0; i < currentPixelData.length; i += 4) {
                    const r = currentPixelData[i];
                    const g = currentPixelData[i + 1];
                    const b = currentPixelData[i + 2];
                    const gray = 0.299 * r + 0.587 * g + 0.114 * b;
                    currentPixelData[i] = gray;
                    currentPixelData[i + 1] = gray;
                    currentPixelData[i + 2] = gray;
                }
            } else {
                console.warn(`Unsupported CPU filter operation: ${operation.name}. Skipping.`);
            }
        }
        return {
            data: currentPixelData,
            width,
            height,
            format: inputImageData.format,
        };
    }
}

/**
 * Applies a single filter operation to CoreImageData using CPU-based processing.
 * This is a synchronous pure function.
 *
 * @param {CoreImageData} imageData - The input image data.
 * @param {FilterOperation} operation - The filter operation to apply.
 * @returns {CoreImageData} The transformed image data.
 */
export function applySingleFilter(
    imageData: CoreImageData,
    operation: FilterOperation
): CoreImageData {
    const currentPixelData = imageData.data instanceof Uint8ClampedArray
        ? Uint8ClampedArray.from(imageData.data) // Create a new copy to ensure purity
        : new Uint8ClampedArray(imageData.data); // Create a new copy
    const { width, height } = imageData;

    if (operation.name === 'grayscale') {
        for (let i = 0; i < currentPixelData.length; i += 4) {
            const r = currentPixelData[i];
            const g = currentPixelData[i + 1];
            const b = currentPixelData[i + 2];
            // Using standard luminance calculation
            const gray = 0.299 * r + 0.587 * g + 0.114 * b;
            currentPixelData[i] = gray;
            currentPixelData[i + 1] = gray;
            currentPixelData[i + 2] = gray;
            // Alpha channel (currentPixelData[i + 3]) remains unchanged
        }
    } else {
        // For MVP, other filters might return the data unchanged or log a warning.
        // Depending on requirements, you might throw an error for unsupported filters.
        console.warn(`applySingleFilter: Unsupported CPU filter operation: ${operation.name}. Returning original data.`);
        // To strictly adhere to returning new data for purity, even if unchanged:
        return {
            ...imageData,
            data: Uint8ClampedArray.from(imageData.data instanceof Uint8ClampedArray ? imageData.data : new Uint8ClampedArray(imageData.data)),
        };
    }

    return {
        data: currentPixelData,
        width,
        height,
        format: imageData.format, // Assuming format doesn't change for this simple filter
    };
}