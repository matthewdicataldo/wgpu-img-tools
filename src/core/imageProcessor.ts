import { FallbackController } from './fallbackController';
import { WebGPURenderer } from '../renderers/webgpu/webgpuRenderer'; // Corrected path
import type { ImageSource, FilterOperation, ProcessedOutput } from '../types';

/**
 * Main class for processing images using WebGPU (with fallback options).
 * 
 * @remarks
 * ImageProcessor manages the lifecycle of image processing operations,
 * including initialization of the appropriate rendering backend,
 * loading images from various sources, and applying filters.
 * 
 * @example
 * ```typescript
 * const processor = new ImageProcessor();
 * await processor.initialize();
 * await processor.initializeRendererWithCanvas(myCanvas);
 * const image = await processor.loadImage('path/to/image.jpg');
 * const result = await processor.applyFilter(image, { type: 'grayscale' });
 * ```
 */
export class ImageProcessor {
    private renderer: WebGPURenderer | null = null; // Or a generic Renderer type
    private device: GPUDevice | null = null;

    constructor() {
        // FallbackController and its initialization removed as it was unused.
        // If fallback logic is implemented later, it should be re-added.
    }

    /**
     * Initializes the image processor with the preferred rendering backend.
     * 
     * @param preferredBackend - The preferred rendering backend to use (defaults to 'webgpu')
     * @returns A promise that resolves when initialization is complete
     * @throws Error if the requested backend is not available or initialization fails
     * 
     * @example
     * ```typescript
     * const processor = new ImageProcessor();
     * await processor.initialize('webgpu');
     * ```
     */
    public async initialize(preferredBackend: string = 'webgpu'): Promise<void> {
        // TODO: Implement backend selection logic via FallbackController
        // For now, directly attempt WebGPU initialization inspired by demo.html
        if (preferredBackend === 'webgpu') {
            if (!navigator.gpu) {
                console.error('WebGPU not supported on this browser.');
                throw new Error('WebGPU not supported');
            }
            try {
                const adapter = await navigator.gpu.requestAdapter();
                if (!adapter) {
                    console.error('Failed to get GPU adapter.');
                    throw new Error('Failed to get GPU adapter');
                }
                this.device = await adapter.requestDevice();
                if (!this.device) {
                    console.error('Failed to get GPU device.');
                    throw new Error('Failed to get GPU device');
                }
                console.log('WebGPU device initialized successfully.');
                // Instantiate the WebGPURenderer
                this.renderer = new WebGPURenderer(this.device);
                // Note: The renderer still needs its own initialize(canvas) call
                // if it's intended to render to a specific canvas. This would typically
                // be handled by the application using the ImageProcessor.
            } catch (error) {
                console.error('WebGPU Initialization Error:', error);
                throw error;
            }
        }
        // TODO: else if (preferredBackend === 'webgl') { ... }
    }

    /**
     * Loads an image from various source types and prepares it for processing.
     * 
     * @param source - The image source (File, HTMLImageElement, ImageBitmap, or URL string)
     * @returns A promise that resolves to an ImageBitmap of the loaded image
     * @throws Error if the image cannot be loaded or if the processor is not initialized
     * 
     * @example
     * ```typescript
     * // Load from URL
     * const image1 = await processor.loadImage('https://example.com/image.jpg');
     * 
     * // Load from file input
     * const fileInput = document.querySelector('input[type="file"]');
     * const image2 = await processor.loadImage(fileInput.files[0]);
     * ```
     */
    public async loadImage(source: ImageSource): Promise<ImageBitmap> {
        if (!this.device) {
            throw new Error('ImageProcessor not initialized or WebGPU device not available.');
        }
        // Logic inspired by demo.html imageUpload listener
        let imageBitmap: ImageBitmap;
        if (source instanceof File) {
            imageBitmap = await createImageBitmap(source);
        } else if (source instanceof HTMLImageElement) {
            if (!source.complete) {
                await new Promise((resolve, reject) => {
                    source.onload = resolve;
                    source.onerror = reject;
                });
            }
            imageBitmap = await createImageBitmap(source);
        } else if (source instanceof ImageBitmap) {
            imageBitmap = source;
        } else if (typeof source === 'string') { // Assuming URL
            const response = await fetch(source);
            if (!response.ok) throw new Error(`Failed to fetch image from URL: ${source}`);
            const blob = await response.blob();
            imageBitmap = await createImageBitmap(blob);
        } else {
            throw new Error('Unsupported image source type');
        }

        // If a renderer is available and expects image uploads this way
        if (this.renderer && this.renderer.uploadImage) {
            // The renderer needs to be initialized with a canvas first by the application
            // for uploadImage to typically make sense in the current renderer design (sizing canvas, etc)
            // This implies an application flow like:
            // 1. processor.initialize()
            // 2. processor.attachCanvasToRenderer(canvas) // New method or pattern
            // 3. processor.loadImage()
            // For now, we assume the renderer is ready if it exists.
            // Awaiting this as uploadImage is async in WebGPURenderer
            await this.renderer.uploadImage(imageBitmap);
        } else {
            console.warn('Renderer not available or uploadImage not supported during loadImage. Texture not uploaded to GPU yet.');
        }

        console.log('Image loaded and ImageBitmap created:', imageBitmap);
        return imageBitmap;
    }

    /**
     * Applies one or more filter operations to the provided image.
     * 
     * @param imageBitmap - The image to process
     * @param operations - A single filter operation or array of operations to apply
     * @returns A promise that resolves to the processed output
     * @throws Error if the renderer is not available or processing fails
     * 
     * @example
     * ```typescript
     * // Apply a single filter
     * const result = await processor.applyFilter(image, { type: 'grayscale' });
     * 
     * // Apply multiple filters (when supported)
     * const result = await processor.applyFilter(image, [
     *   { type: 'grayscale' },
     *   { type: 'blur', radius: 5 }
     * ]);
     * ```
     */
    public async applyFilter(
        imageBitmap: ImageBitmap,
        operations: FilterOperation | FilterOperation[]
    ): Promise<ProcessedOutput> { // Return type changed to ProcessedOutput
        if (!this.renderer) {
            throw new Error('Renderer not available. Initialize ImageProcessor and ensure renderer is initialized (e.g., with a canvas).');
        }
        if (!this.device) {
            throw new Error('WebGPU device not available.');
        }

        // The renderer's process method might expect to render to an initialized canvas context.
        // It also currently returns ImageBitmap as a placeholder.
        // A full implementation for ProcessedOutput might involve texture readback.
        const result = await this.renderer.process(imageBitmap, operations);

        // For now, we assume the result from renderer.process is what we want to return.
        // If it needs to be ImageData, further conversion is needed here or in renderer.
        return result;
    }

    /**
     * Initializes the renderer with a canvas. This is necessary if the renderer
     * will be drawing to a visible canvas or using a canvas context.
     * 
     * @param canvas - The canvas element to initialize the renderer with
     * @returns A promise that resolves when the renderer is initialized
     * @throws Error if the processor or renderer is not initialized
     * 
     * @example
     * ```typescript
     * const canvas = document.getElementById('output-canvas') as HTMLCanvasElement;
     * await processor.initializeRendererWithCanvas(canvas);
     * ```
     */
    public async initializeRendererWithCanvas(canvas: HTMLCanvasElement): Promise<void> {
        if (!this.renderer) {
            throw new Error('ImageProcessor has not been initialized with a WebGPU device yet, or renderer not created.');
        }
        await this.renderer.initialize(canvas);
        console.log("ImageProcessor's renderer has been initialized with a canvas.");
    }

    /**
     * Returns the current GPU device if available.
     * 
     * @returns The GPU device or null if not initialized
     */
    public getGPUDevice(): GPUDevice | null {
        return this.device;
    }
} 