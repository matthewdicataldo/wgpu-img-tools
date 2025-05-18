import { vi, describe, test, expect, beforeEach, afterEach } from 'vitest';
import { applyFilters, applySingleFilter } from './filterProcessor';
import type { CoreImageData, FilterOperation } from '../types';

// Helper to create mock CoreImageData
const createMockImageData = (
    width: number,
    height: number,
    data?: number[] // r, g, b, a, r, g, b, a ...
): CoreImageData => {
    const buffer = data ? new Uint8ClampedArray(data) : new Uint8ClampedArray(width * height * 4);
    return {
        data: buffer,
        width,
        height,
        format: 'rgba8unorm',
    };
};

// Helper to compare CoreImageData (data part)
const expectImageDataToEqual = (received: CoreImageData, expected: CoreImageData) => {
    expect(received.width).toBe(expected.width);
    expect(received.height).toBe(expected.height);
    expect(received.format).toBe(expected.format);
    expect(Array.from(received.data as Uint8ClampedArray)).toEqual(Array.from(expected.data as Uint8ClampedArray));
};


describe('FilterProcessor', () => {
    let mockInputImage: CoreImageData;
    let consoleWarnSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
        // Simple 1x2 image: [red, green]
        // R  G  B  A | R  G  B  A
        // FF 00 00 FF | 00 FF 00 FF
        mockInputImage = createMockImageData(2, 1, [255, 0, 0, 255, 0, 255, 0, 255]);
        consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        vi.spyOn(console, 'log').mockImplementation(() => {}); // Suppress console.log from GPU path messages
    });

    afterEach(() => {
        consoleWarnSpy.mockRestore();
        vi.restoreAllMocks();
    });

    describe('applySingleFilter (CPU)', () => {
        test('should apply grayscale filter correctly', () => {
            const operation: FilterOperation = { name: 'grayscale' };
            const result = applySingleFilter(mockInputImage, operation);

            // Expected grayscale:
            // Pixel 1 (Red): 0.299*255 + 0.587*0 + 0.114*0 = 76.245 -> 76
            // Pixel 2 (Green): 0.299*0 + 0.587*255 + 0.114*0 = 149.685 -> 150
            const expectedData = [76, 76, 76, 255, 150, 150, 150, 255];
            const expectedImage = createMockImageData(2, 1, expectedData);

            expectImageDataToEqual(result, expectedImage);
            // Ensure original data is not mutated (applySingleFilter should return a new copy)
            expect((mockInputImage.data as Uint8ClampedArray)[0]).toBe(255);
        });

        test('should handle unsupported filter by returning original data and warning', () => {
            const operation: FilterOperation = { name: 'unsupported-filter' };
            const result = applySingleFilter(mockInputImage, operation);

            expectImageDataToEqual(result, mockInputImage); // Should return original data (as a new copy)
            expect(consoleWarnSpy).toHaveBeenCalledWith('applySingleFilter: Unsupported CPU filter operation: unsupported-filter. Returning original data.');
            // Ensure original data is not mutated
            expect((mockInputImage.data as Uint8ClampedArray)[0]).toBe(255);
            expect(result.data).not.toBe(mockInputImage.data); // Should be a new array instance
        });

        test('should handle ArrayBuffer input data type', () => {
            const arrayBufferData = new Uint8ClampedArray([255,0,0,255]).buffer;
            const imageWithArrayBuffer: CoreImageData = {
                data: arrayBufferData,
                width: 1,
                height: 1,
                format: 'rgba8unorm'
            };
            const operation: FilterOperation = { name: 'grayscale' };
            const result = applySingleFilter(imageWithArrayBuffer, operation);
            const expectedGray = Math.round(0.299 * 255);
            const resultData = result.data as Uint8ClampedArray; // Cast for indexing
            expect(resultData[0]).toBe(expectedGray);
            expect(resultData[1]).toBe(expectedGray);
            expect(resultData[2]).toBe(expectedGray);
            expect(resultData[3]).toBe(255);
        });
    });

    describe('applyFilters (CPU path)', () => {
        test('should apply a single grayscale filter via CPU path (no device)', async () => {
            const operation: FilterOperation = { name: 'grayscale' };
            const result = await applyFilters(mockInputImage, operation); // No device provided

            const expectedData = [76, 76, 76, 255, 150, 150, 150, 255];
            const expectedImage = createMockImageData(2, 1, expectedData);
            expectImageDataToEqual(result, expectedImage);
        });

        test('should apply multiple grayscale filters (idempotent test for loop)', async () => {
            const operations: FilterOperation[] = [{ name: 'grayscale' }, { name: 'grayscale' }];
            const result = await applyFilters(mockInputImage, operations);

            const expectedData = [76, 76, 76, 255, 150, 150, 150, 255]; // Same as single application
            const expectedImage = createMockImageData(2, 1, expectedData);
            expectImageDataToEqual(result, expectedImage);
        });

        test('should handle unsupported filter in a list and warn', async () => {
            const operations: FilterOperation[] = [{ name: 'unsupported-filter' }];
            const result = await applyFilters(mockInputImage, operations);

            expectImageDataToEqual(result, mockInputImage); // Original data returned
            expect(consoleWarnSpy).toHaveBeenCalledWith('Unsupported CPU filter operation: unsupported-filter. Skipping.');
        });

        test('should process supported filters and skip unsupported ones in a list', async () => {
            const operations: FilterOperation[] = [
                { name: 'grayscale' },
                { name: 'unsupported-filter' },
                // { name: 'grayscale' } // If added, would apply grayscale twice effectively
            ];
            const result = await applyFilters(mockInputImage, operations);

            // Only the first grayscale should apply
            const expectedData = [76, 76, 76, 255, 150, 150, 150, 255];
            const expectedImage = createMockImageData(2, 1, expectedData);
            expectImageDataToEqual(result, expectedImage);
            expect(consoleWarnSpy).toHaveBeenCalledWith('Unsupported CPU filter operation: unsupported-filter. Skipping.');
        });

        test('should use CPU path if device is provided but filter is not single grayscale', async () => {
            const mockDevice = {} as GPUDevice; // Minimal mock device
            const operation: FilterOperation = { name: 'some-other-filter' };
            
            // Spy on the GPU path specific functions to ensure they are NOT called
            const gpuUtils = await import('../renderers/webgpu/webgpuTextureUtils');
            const uploadSpy = vi.spyOn(gpuUtils, 'uploadCoreImageDataToTexture');

            const result = await applyFilters(mockInputImage, operation, mockDevice);
            
            expect(uploadSpy).not.toHaveBeenCalled(); // Confirms GPU path was not taken
            expect(consoleWarnSpy).toHaveBeenCalledWith('Unsupported CPU filter operation: some-other-filter. Skipping.');
            expectImageDataToEqual(result, mockInputImage); // Should return original as 'some-other-filter' is unsupported by CPU
        });

         test('should use CPU path if device is provided but operations are an array', async () => {
            const mockDevice = {} as GPUDevice;
            const operations: FilterOperation[] = [{ name: 'grayscale' }, { name: 'grayscale' }];
            
            const gpuUtils = await import('../renderers/webgpu/webgpuTextureUtils');
            const uploadSpy = vi.spyOn(gpuUtils, 'uploadCoreImageDataToTexture');

            await applyFilters(mockInputImage, operations, mockDevice);
            
            expect(uploadSpy).not.toHaveBeenCalled(); // Confirms GPU path was not taken for array
        });
    });

    // GPU path tests are explicitly excluded by subtask description.
    // If they were to be added, they would need more extensive mocking of WebGPU APIs.
    // Example of how one might start, but this is out of scope for current task:
    /*
    describe('applyFilters (GPU path)', () => {
        let mockDevice: GPUDevice;

        beforeEach(() => {
            mockDevice = {
                createSampler: vi.fn(),
                createTexture: vi.fn(),
                createShaderModule: vi.fn(),
                createPipelineLayout: vi.fn(),
                createRenderPipeline: vi.fn(),
                createCommandEncoder: vi.fn(() => ({
                    beginRenderPass: vi.fn(() => ({
                        setPipeline: vi.fn(),
                        setBindGroup: vi.fn(),
                        draw: vi.fn(),
                        end: vi.fn(),
                    })),
                    copyTextureToBuffer: vi.fn(),
                    finish: vi.fn(),
                })),
                queue: {
                    submit: vi.fn(),
                    onsubmittedworkdone: vi.fn().mockResolvedValue(undefined), // Simulate work done
                } as unknown as GPUQueue,
                createBindGroupLayout: vi.fn(),
                createBindGroup: vi.fn(),
            } as unknown as GPUDevice;

            // Mock the utility functions
            vi.mock('../renderers/webgpu/webgpuTextureUtils', async (importOriginal) => {
                const original = await importOriginal<any>();
                return {
                    ...original,
                    uploadCoreImageDataToTexture: vi.fn(() => ({ format: 'rgba8unorm', destroy: vi.fn() }) as GPUTexture),
                    readbackGpuTextureToCoreImageData: vi.fn().mockResolvedValue(createMockImageData(1,1,[0,0,0,255]))
                };
            });
             vi.mock('../renderers/webgpu/webgpuPipelineUtils', async (importOriginal) => {
                const original = await importOriginal<any>();
                return {
                    ...original,
                    createGpuRenderPipeline: vi.fn(() => ({ getBindGroupLayout: vi.fn() }) as GPURenderPipeline),
                    createGpuBindGroup: vi.fn(() => ({}) as GPUBindGroup),
                    executeGpuRenderPass: vi.fn(),
                };
            });
        });

        test('should attempt GPU path for single grayscale filter with device', async () => {
            const operation: FilterOperation = { name: 'grayscale' };
            const input = createMockImageData(1, 1, [100, 150, 200, 255]);
            
            // Ensure mocks from webgpuTextureUtils are used
            const { uploadCoreImageDataToTexture, readbackGpuTextureToCoreImageData } = await import('../renderers/webgpu/webgpuTextureUtils');
            const { createGpuRenderPipeline: createPipelineUtil, createGpuBindGroup: createBindGroupUtil, executeGpuRenderPass: executePassUtil } = await import('../renderers/webgpu/webgpuPipelineUtils');


            await applyFilters(input, operation, mockDevice);

            expect(uploadCoreImageDataToTexture).toHaveBeenCalled();
            expect(createPipelineUtil).toHaveBeenCalled();
            expect(createBindGroupUtil).toHaveBeenCalled();
            expect(executePassUtil).toHaveBeenCalled();
            expect(readbackGpuTextureToCoreImageData).toHaveBeenCalled();
        });
    });
    */
});