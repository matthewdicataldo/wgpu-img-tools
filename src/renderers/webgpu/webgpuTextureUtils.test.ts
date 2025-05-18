import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { CoreImageData } from '../../../src/types'; // Adjust path
import {
    uploadCoreImageDataToTexture,
    readbackGpuTextureToCoreImageData,
} from '../../../src/renderers/webgpu/webgpuTextureUtils'; // Adjust path

// --- Mock WebGPU Constants ---
if (typeof global.GPUTextureUsage === 'undefined') {
    global.GPUTextureUsage = {
        COPY_SRC: 0x01,
        COPY_DST: 0x02,
        TEXTURE_BINDING: 0x04,
        STORAGE_BINDING: 0x08,
        RENDER_ATTACHMENT: 0x10,
    } as any; // Use 'as any' to assign to global type if needed
}

if (typeof global.GPUBufferUsage === 'undefined') {
    global.GPUBufferUsage = {
        MAP_READ: 0x0001,
        MAP_WRITE: 0x0002,
        COPY_SRC: 0x0004,
        COPY_DST: 0x0008,
        INDEX: 0x0010,
        VERTEX: 0x0020,
        UNIFORM: 0x0040,
        STORAGE: 0x0080,
        INDIRECT: 0x0100,
        QUERY_RESOLVE: 0x0200,
    } as any;
}

if (typeof global.GPUMapMode === 'undefined') {
    global.GPUMapMode = {
        READ: 0x0001,
        WRITE: 0x0002,
    } as any;
}
// --- End Mock WebGPU Constants ---

// --- Mocks for WebGPU Objects ---
const mockWriteTexture = vi.fn();
const mockCreateTexture = vi.fn();
const mockCreateBuffer = vi.fn();
const mockCreateCommandEncoder = vi.fn();
const mockSubmit = vi.fn();
const mockMapAsync = vi.fn();
const mockGetMappedRange = vi.fn();
const mockUnmap = vi.fn();
const mockDestroyBuffer = vi.fn();
const mockFinishCommandEncoder = vi.fn();
const mockCopyTextureToBuffer = vi.fn(); // Added this mock specifically

const mockGPUDevice: Partial<GPUDevice> = {
    createTexture: mockCreateTexture,
    createBuffer: mockCreateBuffer,
    createCommandEncoder: mockCreateCommandEncoder,
    queue: {
        writeTexture: mockWriteTexture,
        submit: mockSubmit,
    } as Partial<GPUQueue> as GPUQueue,
};

const mockGPUTexture: Partial<GPUTexture> = {
    format: 'rgba8unorm', // Default mock format
    // Add other properties if needed by the functions
};

const mockGPUBuffer: Partial<GPUBuffer> = {
    mapAsync: mockMapAsync,
    getMappedRange: mockGetMappedRange,
    unmap: mockUnmap,
    destroy: mockDestroyBuffer,
};

const mockGPUCommandEncoder: Partial<GPUCommandEncoder> = {
    copyTextureToBuffer: mockCopyTextureToBuffer, // Using the specific mock
    finish: mockFinishCommandEncoder,
};

// --- End Mocks ---

describe('WebGPU Texture Utilities', () => {
    beforeEach(() => {
        // Reset mocks before each test
        vi.clearAllMocks();

        // Default mock implementations
        mockCreateTexture.mockReturnValue(mockGPUTexture as GPUTexture);
        mockCreateBuffer.mockReturnValue(mockGPUBuffer as GPUBuffer);
        mockCreateCommandEncoder.mockReturnValue(mockGPUCommandEncoder as GPUCommandEncoder);
        mockFinishCommandEncoder.mockReturnValue({} as GPUCommandBuffer); // Needs to return a command buffer
        mockGetMappedRange.mockReturnValue(new ArrayBuffer(0)); // Default empty buffer
    });

    describe('uploadCoreImageDataToTexture', () => {
        it('should create a texture with correct parameters for Uint8ClampedArray data', () => {
            const imageData: CoreImageData = {
                data: new Uint8ClampedArray([255, 0, 0, 255]),
                width: 1,
                height: 1,
                format: 'rgba8unorm',
            };
            const usageFlags = GPUTextureUsage.COPY_SRC | GPUTextureUsage.TEXTURE_BINDING;

            uploadCoreImageDataToTexture(mockGPUDevice as GPUDevice, imageData, usageFlags);

            expect(mockCreateTexture).toHaveBeenCalledWith({
                size: [imageData.width, imageData.height, 1],
                format: 'rgba8unorm', // Assuming this for now
                usage: usageFlags,
            });
            expect(mockWriteTexture).toHaveBeenCalledOnce();
            const writeTextureArgs = mockWriteTexture.mock.calls[0];
            expect(writeTextureArgs[0].texture).toEqual(mockGPUTexture); // Destination
            expect(writeTextureArgs[1]).toBeInstanceOf(ArrayBuffer); // Data source (buffer of Uint8ClampedArray)
            expect(writeTextureArgs[1].byteLength).toBe(4);
            expect(writeTextureArgs[2]).toEqual({ // Data layout
                offset: 0,
                bytesPerRow: 1 * 4, // width * bytesPerPixel
                rowsPerImage: 1,    // height
            });
            expect(writeTextureArgs[3]).toEqual({ // Size
                width: imageData.width,
                height: imageData.height,
                depthOrArrayLayers: 1,
            });
        });

        it('should use ArrayBuffer data directly if provided', () => {
            const buffer = new ArrayBuffer(4);
            new Uint8ClampedArray(buffer).set([0, 255, 0, 255]);
            const imageData: CoreImageData = {
                data: buffer,
                width: 1,
                height: 1,
                format: 'rgba8unorm',
            };
            uploadCoreImageDataToTexture(mockGPUDevice as GPUDevice, imageData);
            expect(mockWriteTexture).toHaveBeenCalledOnce();
            expect(mockWriteTexture.mock.calls[0][1]).toBe(buffer); // Data source should be the ArrayBuffer itself
        });

        // TODO: Add test for CoreImageData.format to GPUTextureFormat mapping if implemented
    });

    describe('readbackGpuTextureToCoreImageData', () => {
        it('should correctly read back data from a texture (no padding)', async () => {
            const width = 2, height = 1, bytesPerPixel = 4;
            const mockTextureData = new Uint8ClampedArray([255, 0, 0, 255, 0, 255, 0, 255]); // 2 pixels
            mockGetMappedRange.mockReturnValueOnce(mockTextureData.buffer.slice(0)); // Return a copy

            // Calculate expected aligned buffer size for the assertion
            const unalignedBytesPerRow = width * bytesPerPixel; // 2*4 = 8
            const alignedBytesPerRow = Math.ceil(unalignedBytesPerRow / 256) * 256; // ceil(8/256)*256 = 256
            const expectedBufferSize = alignedBytesPerRow * height; // 256 * 1 = 256

            const result = await readbackGpuTextureToCoreImageData(
                mockGPUDevice as GPUDevice,
                mockGPUTexture as GPUTexture,
                width,
                height
            );

            expect(mockCreateBuffer).toHaveBeenCalledWith(expect.objectContaining({
                size: expectedBufferSize, // Corrected: should be aligned size
                usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
            }));
            expect(mockCopyTextureToBuffer).toHaveBeenCalledOnce();
            expect(mockMapAsync).toHaveBeenCalledOnce();
            expect(mockUnmap).toHaveBeenCalledOnce();
            expect(mockDestroyBuffer).toHaveBeenCalledOnce();

            expect(result.width).toBe(width);
            expect(result.height).toBe(height);
            expect(result.format).toBe('rgba8unorm');
            expect(result.data).toEqual(mockTextureData);
        });

        it('should correctly handle and strip row padding during readback', async () => {
            const width = 3, height = 1, bytesPerPixel = 4; // 3 pixels, unaligned width for 256-byte row
            const unalignedBytesPerRow = width * bytesPerPixel; // 12
            const alignedBytesPerRow = Math.ceil(unalignedBytesPerRow / 256) * 256; // 256

            // Simulate padded data in the mapped range
            const paddedBuffer = new ArrayBuffer(alignedBytesPerRow * height);
            const paddedView = new Uint8ClampedArray(paddedBuffer);
            const actualPixelData = new Uint8ClampedArray([
                1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12 // 3 pixels
            ]);
            paddedView.set(actualPixelData, 0); // Put actual data at the start of the padded row

            mockGetMappedRange.mockReturnValueOnce(paddedBuffer.slice(0));

            const result = await readbackGpuTextureToCoreImageData(
                mockGPUDevice as GPUDevice,
                mockGPUTexture as GPUTexture,
                width,
                height
            );

            expect(mockCreateBuffer).toHaveBeenCalledWith(expect.objectContaining({
                size: alignedBytesPerRow * height,
            }));
            expect(result.data.length).toBe(unalignedBytesPerRow * height); // Should be unpadded length
            expect(result.data).toEqual(actualPixelData);
        });

        it('should correctly propagate sourceTexture.format to CoreImageData', async () => {
            const width = 1, height = 1, bytesPerPixel = 4;
            const mockTextureData = new Uint8ClampedArray([10, 20, 30, 40]);
            mockGetMappedRange.mockReturnValueOnce(mockTextureData.buffer.slice(0));

            const customMockTexture: Partial<GPUTexture> = {
                ...mockGPUTexture, // Spread existing mock properties
                format: 'bgra8unorm', // Test with a different format
            };

            const result = await readbackGpuTextureToCoreImageData(
                mockGPUDevice as GPUDevice,
                customMockTexture as GPUTexture,
                width,
                height
            );

            expect(result.format).toBe('bgra8unorm');
        });
    });
}); 