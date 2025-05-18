import { vi, describe, test, expect, beforeEach } from 'vitest';
import { loadImageData } from './imageLoader';
// import type { ImageSource, CoreImageData } from '../types';

// Mock data for a 1x1 red pixel PNG
const MOCK_PNG_BASE64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
const MOCK_IMAGE_DATA = new Uint8ClampedArray([255, 0, 0, 255]); // RGBA for red

// --- Mocks ---
let mockImageBitmap: ImageBitmap;
let mockCanvasContext: OffscreenCanvasRenderingContext2D | null;
// let mockHTMLImageElement: HTMLImageElement; // We create this fresh in tests or beforeEach

// --- Global Mocks for Browser APIs ---

// Mock for ImageBitmap constructor/class if not provided by happy-dom
if (typeof global.ImageBitmap === 'undefined') {
    global.ImageBitmap = class MockImageBitmap {
        width: number;
        height: number;
        constructor(width = 0, height = 0) { // Added default values
            this.width = width;
            this.height = height;
        }
        close() {
            // Mock close function
        }
    } as any;
}

// Mock for HTMLImageElement constructor/class if not provided by happy-dom
if (typeof global.HTMLImageElement === 'undefined') {
    global.HTMLImageElement = class MockHTMLImageElement {
        complete: boolean;
        naturalWidth: number;
        naturalHeight: number;
        src: string;
        onload: ((this: GlobalEventHandlers, ev: Event) => any) | null;
        onerror: OnErrorEventHandler;

        constructor(width?: number, height?: number) { // Optional params for consistency
            this.complete = false;
            this.naturalWidth = width || 0;
            this.naturalHeight = height || 0;
            this.src = '';
            this.onload = null;
            this.onerror = null;
        }
        // Add other methods/properties if needed by the code under test
    } as any;
}

// Mock for ImageBitmap instance properties/methods
const mockClose = vi.fn();
const createMockImageBitmap = (width = 1, height = 1): ImageBitmap => {
    const bitmap = new (global.ImageBitmap as any)(width, height) as ImageBitmap;
    (bitmap as any).close = mockClose; // Assign mockClose to the instance
    return bitmap;
};

// Mock for OffscreenCanvas
global.OffscreenCanvas = vi.fn().mockImplementation((width: number, height: number) => {
    const mockGetContext = vi.fn((contextId: string) => {
        if (contextId === '2d') {
            return mockCanvasContext;
        }
        return null;
    });
    return {
        width,
        height,
        getContext: mockGetContext,
        // Add other OffscreenCanvas methods if needed
    };
}) as any;

// Mock for HTMLImageElement
const createMockHTMLImageElement = (complete = true, naturalWidth = 1, naturalHeight = 1, src = MOCK_PNG_BASE64): HTMLImageElement => {
    const img = new (global.HTMLImageElement as any)() as any; // Cast instance to any for property assignment
    img.complete = complete;
    img.naturalWidth = naturalWidth;
    img.naturalHeight = naturalHeight;
    img.src = src;
    img.onload = null;
    img.onerror = null;
    return img as HTMLImageElement; // Cast back to HTMLImageElement for return type
};

// Mock for global.fetch
global.fetch = vi.fn();

// Mock for global.createImageBitmap
global.createImageBitmap = vi.fn(async (source: ImageBitmapSource) => {
    if (source instanceof HTMLImageElement && source.naturalWidth === 0) {
        throw new Error('Failed to create ImageBitmap from broken HTMLImageElement');
    }
    if (source instanceof Blob && source.type === 'image/invalid') {
        throw new Error('Failed to create ImageBitmap from invalid Blob');
    }
    return mockImageBitmap;
});


describe('loadImageData', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockImageBitmap = createMockImageBitmap(1, 1);
        mockCanvasContext = {
            drawImage: vi.fn(),
            getImageData: vi.fn(() => ({
                data: MOCK_IMAGE_DATA,
                width: 1,
                height: 1,
            })),
        } as unknown as OffscreenCanvasRenderingContext2D;
        // mockHTMLImageElement = createMockHTMLImageElement(); // Create as needed in tests
        (global.fetch as any).mockResolvedValue({ // Cast to any
            ok: true,
            blob: async () => new Blob(['mock image data'], { type: 'image/png' }),
        });
    });

    test('should load from ImageBitmap source', async () => {
        const source: ImageBitmap = mockImageBitmap;
        const result = await loadImageData(source);
        expect(result).toEqual({
            data: MOCK_IMAGE_DATA,
            width: 1,
            height: 1,
            format: 'rgba8unorm',
        });
        expect(mockClose).toHaveBeenCalledTimes(1); // Check mockClose
        expect(global.createImageBitmap).not.toHaveBeenCalled();
    });

    test('should load from HTMLImageElement source (already complete)', async () => {
        const source: HTMLImageElement = createMockHTMLImageElement(true, 1, 1);
        const result = await loadImageData(source);
        expect(result).toEqual({
            data: MOCK_IMAGE_DATA,
            width: 1,
            height: 1,
            format: 'rgba8unorm',
        });
        expect(global.createImageBitmap).toHaveBeenCalledWith(source);
        expect(mockClose).toHaveBeenCalledTimes(1); // Check mockClose
    });

    test('should load from HTMLImageElement source (loads asynchronously)', async () => {
        const incompleteImage = createMockHTMLImageElement(false, 1, 1) as any; // Use 'as any' to modify onload/onerror for test
        const resultPromise = loadImageData(incompleteImage as HTMLImageElement);

        // Simulate successful load
        incompleteImage.onload?.(new Event('load'));
        // Wait for the internal promise in loadImageData to resolve
        await new Promise(resolve => setTimeout(resolve, 0));

        const result = await resultPromise;

        expect(result).toEqual({
            data: MOCK_IMAGE_DATA,
            width: 1,
            height: 1,
            format: 'rgba8unorm',
        });
        expect(global.createImageBitmap).toHaveBeenCalledWith(incompleteImage);
        expect(mockClose).toHaveBeenCalledTimes(1); // Check mockClose
    });

    test('should reject if HTMLImageElement fails to load', async () => {
        const brokenImage = createMockHTMLImageElement(false, 0, 0) as any; // naturalWidth = 0 indicates broken
        const loadPromise = loadImageData(brokenImage as HTMLImageElement);

        // Simulate error
        brokenImage.onerror?.(new Event('error'));
        // Wait for the internal promise in loadImageData to resolve
        await new Promise(resolve => setTimeout(resolve, 0)); // Allow event loop to process onerror

        try {
            await loadPromise;
            // If loadImageData resolves, the test should fail, as we expect a rejection.
            // This line will only be reached if the promise unexpectedly resolves.
            expect(true).toBe(false); // Force failure if no error is thrown
        } catch (error: any) {
            expect(error).toBeInstanceOf(Error);
            expect(error.message).toBe('Failed to load image element');
        }
        expect(mockClose).not.toHaveBeenCalled(); // Check mockClose
    });


    test('should load from File source', async () => {
        const mockFile = new File(['mock image content'], 'test.png', { type: 'image/png' });
        const source: File = mockFile;
        const result = await loadImageData(source);
        expect(result).toEqual({
            data: MOCK_IMAGE_DATA,
            width: 1,
            height: 1,
            format: 'rgba8unorm',
        });
        expect(global.createImageBitmap).toHaveBeenCalledWith(mockFile);
        expect(mockClose).toHaveBeenCalledTimes(1); // Check mockClose
    });

    test('should load from URL string source', async () => {
        const source: string = MOCK_PNG_BASE64;
        const result = await loadImageData(source);
        expect(result).toEqual({
            data: MOCK_IMAGE_DATA,
            width: 1,
            height: 1,
            format: 'rgba8unorm',
        });
        expect(global.fetch).toHaveBeenCalledWith(source);
        expect(global.createImageBitmap).toHaveBeenCalledWith(expect.any(Blob));
        expect(mockClose).toHaveBeenCalledTimes(1); // Check mockClose
    });

    test('should reject if fetching URL fails (network error)', async () => {
        (global.fetch as any).mockRejectedValueOnce(new Error('Network error')); // Cast to any
        const source: string = 'http://localhost/nonexistent.png';
        await expect(loadImageData(source)).rejects.toThrow('Network error');
        expect(mockClose).not.toHaveBeenCalled(); // Check mockClose
    });

    test('should reject if fetching URL fails (bad status)', async () => {
        (global.fetch as any).mockResolvedValueOnce({ // Cast to any
            ok: false,
            status: 404,
            blob: async () => new Blob([]),
        });
        const source: string = 'http://localhost/notfound.png';
        await expect(loadImageData(source)).rejects.toThrow('Failed to fetch image from URL: http://localhost/notfound.png, status: 404');
        expect(mockClose).not.toHaveBeenCalled(); // Check mockClose
    });

    test('should reject if ImageBitmap has zero width', async () => {
        mockImageBitmap = createMockImageBitmap(0, 1);
        const source: ImageBitmap = mockImageBitmap;
        await expect(loadImageData(source)).rejects.toThrow('ImageBitmap has zero width or height.');
        // Check if close was attempted during error handling
        expect(mockClose).not.toHaveBeenCalled(); // Corrected: close is not called if width/height is zero before canvas ops
    });

    test('should reject if ImageBitmap has zero height', async () => {
        mockImageBitmap = createMockImageBitmap(1, 0);
        const source: ImageBitmap = mockImageBitmap;
        await expect(loadImageData(source)).rejects.toThrow('ImageBitmap has zero width or height.');
        expect(mockClose).not.toHaveBeenCalled(); // Corrected: close is not called if width/height is zero before canvas ops
    });

    test('should reject if OffscreenCanvas context cannot be created', async () => {
        mockCanvasContext = null; // Simulate context creation failure
        const source: ImageBitmap = mockImageBitmap; // Use a valid mockImageBitmap for this test
        mockImageBitmap = createMockImageBitmap(1, 1); // Re-create to ensure close hasn't been called from other tests
        await expect(loadImageData(source)).rejects.toThrow('Failed to get OffscreenCanvas 2D context');
        expect(mockClose).toHaveBeenCalledTimes(1); // Ensure close is called even on canvas error
    });

    test('should reject for unsupported source type', async () => {
        const unsupportedSource = { data: 'some data' } as any;
        await expect(loadImageData(unsupportedSource)).rejects.toThrow('Unsupported image source type: object');
         expect(mockClose).not.toHaveBeenCalled(); // Check mockClose
    });

    test('should attempt to close ImageBitmap even if canvas operations fail', async () => {
        mockImageBitmap = createMockImageBitmap(1, 1); // Ensure a fresh mock for this test
        mockCanvasContext = {
            drawImage: vi.fn(),
            getImageData: vi.fn(() => { throw new Error('Canvas error'); }),
        } as unknown as OffscreenCanvasRenderingContext2D;
        const source: ImageBitmap = mockImageBitmap;
        await expect(loadImageData(source)).rejects.toThrow('Canvas error');
        expect(mockClose).toHaveBeenCalledTimes(1); // Check mockClose
    });

    test('should handle error during ImageBitmap.close in error path', async () => {
        // Simulate a scenario where canvas operation fails, then bitmap close also fails
        mockImageBitmap = createMockImageBitmap(1, 1); // Valid bitmap
        if (mockCanvasContext) { // Ensure mockCanvasContext is not null
           mockCanvasContext.getImageData = vi.fn(() => { throw new Error('Simulated canvas processing error'); });
        } else {
            throw new Error("mockCanvasContext is null, test setup error"); // Should not happen with beforeEach
        }

        mockClose.mockImplementationOnce(() => { throw new Error('Bitmap close operation failed'); });
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        const source: ImageBitmap = mockImageBitmap;
        // The loadImageData should throw the original canvas error
        await expect(loadImageData(source)).rejects.toThrow('Simulated canvas processing error');

        // close should have been called once in the error handling path of loadImageData
        expect(mockClose).toHaveBeenCalledTimes(1);
        // And the error during close should have been caught and logged
        expect(consoleErrorSpy).toHaveBeenCalledWith('Error closing ImageBitmap during error handling:', expect.objectContaining({ message: 'Bitmap close operation failed' }));
        
        consoleErrorSpy.mockRestore();
    });

    test('should load from File source that causes createImageBitmap to fail', async () => {
        const mockInvalidFile = new File(['invalid content'], 'invalid.txt', { type: 'image/invalid' });
        (global.createImageBitmap as any).mockRejectedValueOnce(new Error('Bitmap creation failed for invalid file')); // Already any, no change needed from this specific error type
        const source: File = mockInvalidFile;

        await expect(loadImageData(source)).rejects.toThrow('Bitmap creation failed for invalid file');
        expect(global.createImageBitmap).toHaveBeenCalledWith(mockInvalidFile);
        expect(mockClose).not.toHaveBeenCalled(); // Check mockClose
    });
});