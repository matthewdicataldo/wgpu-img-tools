import { vi, describe, test, expect, beforeEach, afterEach } from 'vitest';
import { ImageProcessor } from './imageProcessor';
import { WebGPURenderer } from '../renderers/webgpu/webgpuRenderer';
import type { ImageSource, FilterOperation, ProcessedOutput } from '../types'; // Removed CoreImageData

// --- Mocks ---
// Define spies for renderer methods BEFORE the mock implementation
const mockRendererInitialize = vi.fn(async () => {});
const mockRendererUploadImage = vi.fn(async () => {});
const mockRendererProcess = vi.fn(async () => mockImageBitmap as ProcessedOutput); // mockImageBitmap will be defined in beforeEach

vi.mock('../renderers/webgpu/webgpuRenderer', () => {
  return {
    WebGPURenderer: vi.fn().mockImplementation(() => {
      return {
        initialize: mockRendererInitialize,
        uploadImage: mockRendererUploadImage,
        process: mockRendererProcess,
      };
    }),
  };
});

let mockDevice: GPUDevice;
let mockAdapter: GPUAdapter;
let mockCanvas: HTMLCanvasElement;
let mockImageBitmap: ImageBitmap;

// Mock for ImageBitmap constructor/class if not provided by happy-dom
if (typeof global.ImageBitmap === 'undefined') {
    global.ImageBitmap = class MockImageBitmap {
        width: number;
        height: number;
        constructor(width = 0, height = 0) {
            this.width = width;
            this.height = height;
        }
        close() { /* Mock close */ }
    } as any;
}
// Mock for HTMLImageElement constructor/class if not provided by happy-dom
if (typeof global.HTMLImageElement === 'undefined') {
    global.HTMLImageElement = class MockHTMLImageElement {
        complete = false;
        naturalWidth = 0;
        naturalHeight = 0;
        src = '';
        onload: ((this: GlobalEventHandlers, ev: Event) => any) | null = null;
        onerror: OnErrorEventHandler = null;
    } as any;
}
// Mock for File
if (typeof global.File === 'undefined') {
    global.File = class MockFile {
        constructor(_parts: (string | Blob | ArrayBuffer | ArrayBufferView)[], _filename: string, _options?: FilePropertyBag) { /* Mock File */ }
    } as any;
}


describe('ImageProcessor', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        mockDevice = {
            label: 'mock-device',
            // Add other necessary GPUDevice properties/methods if needed by WebGPURenderer mock
        } as unknown as GPUDevice;

        mockAdapter = {
            requestDevice: vi.fn(async () => mockDevice),
            // Add other necessary GPUAdapter properties if needed
        } as unknown as GPUAdapter;

        (global.navigator as any).gpu = { // Cast to any for assignment
            requestAdapter: vi.fn(async () => mockAdapter),
        } as unknown as GPU;

        mockCanvas = {
            getContext: vi.fn(),
            // Add other necessary HTMLCanvasElement properties if needed
        } as unknown as HTMLCanvasElement;

        mockImageBitmap = new (global.ImageBitmap as any)(1, 1) as ImageBitmap; // Ensure 'any' if constructor has issues
        (mockImageBitmap as any).close = vi.fn();


        global.createImageBitmap = vi.fn(async () => mockImageBitmap);
        global.fetch = vi.fn(async () => ({
            ok: true,
            blob: async () => new Blob(['mock image data'], { type: 'image/png' }),
        })) as any;

        // WebGPURenderer constructor is already mocked by the top-level vi.mock
        // vi.clearAllMocks() in the global beforeEach (or this one) will clear call counts
        // for mockRendererInitialize, mockRendererUploadImage, mockRendererProcess.
    });

    afterEach(() => {
        delete (global.navigator as any).gpu; // Cast to any for deletion
    });

    describe('initialize', () => {
        test('should initialize WebGPU successfully', async () => {
            const processor = new ImageProcessor();
            await processor.initialize('webgpu');
            expect((global.navigator as any).gpu?.requestAdapter).toHaveBeenCalled();
            expect(mockAdapter.requestDevice).toHaveBeenCalled();
            expect(processor.getGPUDevice()).toBe(mockDevice);
            expect(WebGPURenderer).toHaveBeenCalledWith(mockDevice);
        });

        test('should throw if WebGPU is not supported', async () => {
            (global.navigator as any).gpu = undefined; // Cast to any for assignment
            const processor = new ImageProcessor();
            await expect(processor.initialize('webgpu')).rejects.toThrow('WebGPU not supported');
        });

        test('should throw if GPU adapter request fails', async () => {
            ((global.navigator as any).gpu?.requestAdapter as any)?.mockResolvedValueOnce(null);
            const processor = new ImageProcessor();
            await expect(processor.initialize('webgpu')).rejects.toThrow('Failed to get GPU adapter');
        });

        test('should throw if GPU device request fails', async () => {
            (mockAdapter.requestDevice as any)?.mockResolvedValueOnce(null);
            const processor = new ImageProcessor();
            await expect(processor.initialize('webgpu')).rejects.toThrow('Failed to get GPU device');
        });

        test('should throw if GPU device request promise rejects', async () => {
            (mockAdapter.requestDevice as any)?.mockRejectedValueOnce(new Error('Device request failed'));
            const processor = new ImageProcessor();
            await expect(processor.initialize('webgpu')).rejects.toThrow('Device request failed');
        });
    });

    describe('loadImage', () => {
        let processor: ImageProcessor;
        beforeEach(async () => {
            processor = new ImageProcessor();
            await processor.initialize('webgpu'); // Initialize to get device and renderer
        });

        test('should load image from URL string', async () => {
            const url = 'http://example.com/image.png';
            const result = await processor.loadImage(url);
            expect(fetch).toHaveBeenCalledWith(url);
            expect(createImageBitmap).toHaveBeenCalledWith(expect.any(Blob));
            expect(result).toBe(mockImageBitmap);
            expect(mockRendererUploadImage).toHaveBeenCalledWith(mockImageBitmap);
        });

        test('should load image from File object', async () => {
            const file = new File(['content'], 'image.png', { type: 'image/png' });
            const result = await processor.loadImage(file);
            expect(createImageBitmap).toHaveBeenCalledWith(file);
            expect(result).toBe(mockImageBitmap);
            expect(mockRendererUploadImage).toHaveBeenCalledWith(mockImageBitmap);
        });

        test('should load image from HTMLImageElement (complete)', async () => {
            const imgEl = new (global.HTMLImageElement as any)() as HTMLImageElement;
            (imgEl as any).complete = true;
            (imgEl as any).naturalWidth = 1;
            const result = await processor.loadImage(imgEl);
            expect(createImageBitmap).toHaveBeenCalledWith(imgEl);
            expect(result).toBe(mockImageBitmap);
        });

        test('should load image from HTMLImageElement (incomplete, then loads)', async () => {
            const imgEl = new (global.HTMLImageElement as any)() as HTMLImageElement;
            (imgEl as any).complete = false;
            (imgEl as any).naturalWidth = 0;

            const loadImagePromise = processor.loadImage(imgEl);
            // Simulate onload
            if (imgEl.onload) {
                imgEl.onload(new Event('load'));
            }
            (imgEl as any).complete = true;
            (imgEl as any).naturalWidth = 1;

            const result = await loadImagePromise;
            expect(createImageBitmap).toHaveBeenCalledWith(imgEl);
            expect(result).toBe(mockImageBitmap);
        });


        test('should load image from ImageBitmap directly', async () => {
            const result = await processor.loadImage(mockImageBitmap);
            expect(createImageBitmap).not.toHaveBeenCalled(); // Should not call it if source is already ImageBitmap
            expect(result).toBe(mockImageBitmap);
        });

        test('should throw if processor is not initialized (no device)', async () => {
            const uninitializedProcessor = new ImageProcessor(); // No initialize() call
            await expect(uninitializedProcessor.loadImage('url')).rejects.toThrow('ImageProcessor not initialized or WebGPU device not available.');
        });

        test('should throw for unsupported image source type', async () => {
            const unsupportedSource = {} as ImageSource;
            await expect(processor.loadImage(unsupportedSource)).rejects.toThrow('Unsupported image source type');
        });

        test('should warn if renderer has no uploadImage method during loadImage', async () => {
            const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
            // To test this, we need to make the *mocked constructor* return an instance
            // without uploadImage. This is tricky with the current top-level mock structure
            // without re-mocking WebGPURenderer specifically for this test.
            // For simplicity, we'll assume the processor's renderer is the one from the mock.
            // This test might need a more specific mock setup if it were critical.
            
            // Re-implement the mock for this specific test case to return an instance without uploadImage
            const originalMock = WebGPURenderer;
            (WebGPURenderer as any).mockImplementationOnce(() => ({
                initialize: vi.fn(async () => {}),
                // uploadImage is omitted
                process: vi.fn(async () => mockImageBitmap as ProcessedOutput),
            }));
            
            // Create a new processor instance that will use this specific mock implementation
            const testProcessor = new ImageProcessor();
            await testProcessor.initialize('webgpu'); // This will use the mockImplementationOnce

            await testProcessor.loadImage(mockImageBitmap);
            expect(consoleWarnSpy).toHaveBeenCalledWith('Renderer not available or uploadImage not supported during loadImage. Texture not uploaded to GPU yet.');
            
            consoleWarnSpy.mockRestore();
            // Restore the original mock for other tests
            (WebGPURenderer as any).mockImplementation((originalMock as any).getMockImplementation() || (() => ({
                initialize: mockRendererInitialize,
                uploadImage: mockRendererUploadImage,
                process: mockRendererProcess,
            })));
        });
    });

    describe('applyFilter', () => {
        let processor: ImageProcessor;
        beforeEach(async () => {
            processor = new ImageProcessor();
            await processor.initialize('webgpu');
        });

        test('should apply a single filter operation', async () => {
            const filterOp: FilterOperation = { name: 'grayscale' };
            const expectedOutput: ProcessedOutput = mockImageBitmap;
            mockRendererProcess.mockResolvedValueOnce(expectedOutput); // Use the direct spy

            const result = await processor.applyFilter(mockImageBitmap, filterOp);
            expect(mockRendererProcess).toHaveBeenCalledWith(mockImageBitmap, filterOp);
            expect(result).toBe(expectedOutput);
        });

        test('should apply an array of filter operations', async () => {
            const filterOps: FilterOperation[] = [{ name: 'grayscale' }, { name: 'blur', options: { radius: 2 } }];
            const expectedOutput: ProcessedOutput = mockImageBitmap;
            mockRendererProcess.mockResolvedValueOnce(expectedOutput); // Use the direct spy

            const result = await processor.applyFilter(mockImageBitmap, filterOps);
            expect(mockRendererProcess).toHaveBeenCalledWith(mockImageBitmap, filterOps);
            expect(result).toBe(expectedOutput);
        });

        test('should throw if renderer is not available', async () => {
            const uninitializedProcessor = new ImageProcessor(); // No initialize, so no renderer
            // Manually set device to bypass the device check for this specific test focus
            (uninitializedProcessor as any).device = mockDevice;

            const filterOp: FilterOperation = { name: 'grayscale' }; // Corrected
            await expect(uninitializedProcessor.applyFilter(mockImageBitmap, filterOp)).rejects.toThrow('Renderer not available. Initialize ImageProcessor and ensure renderer is initialized (e.g., with a canvas).');
        });

        test('should throw if device is not available', async () => {
            const uninitializedProcessor = new ImageProcessor(); // No initialize, so no device
            // Manually set a mock renderer to bypass the renderer check
            (uninitializedProcessor as any).renderer = (WebGPURenderer as any).mock.instances[0];

            const filterOp: FilterOperation = { name: 'grayscale' }; // Corrected
            await expect(uninitializedProcessor.applyFilter(mockImageBitmap, filterOp)).rejects.toThrow('WebGPU device not available.');
        });
    });

    describe('initializeRendererWithCanvas', () => {
        test('should call renderer.initialize with the canvas', async () => {
            const processor = new ImageProcessor();
            await processor.initialize('webgpu');

            await processor.initializeRendererWithCanvas(mockCanvas);
            expect(mockRendererInitialize).toHaveBeenCalledWith(mockCanvas); // Use the direct spy
        });

        test('should throw if renderer is not initialized (processor not initialized)', async () => {
            const processor = new ImageProcessor(); // No initialize() call
            await expect(processor.initializeRendererWithCanvas(mockCanvas)).rejects.toThrow('ImageProcessor has not been initialized with a WebGPU device yet, or renderer not created.');
        });
    });

    describe('getGPUDevice', () => {
        test('should return the device after successful initialization', async () => {
            const processor = new ImageProcessor();
            await processor.initialize('webgpu');
            expect(processor.getGPUDevice()).toBe(mockDevice);
        });

        test('should return null if not initialized', () => {
            const processor = new ImageProcessor();
            expect(processor.getGPUDevice()).toBeNull();
        });
    });
});