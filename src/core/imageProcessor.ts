import { FallbackController } from './fallbackController';
import { WebGPURenderer } from '../renderers/webgpu/webgpuRenderer'; // Corrected path
import type { ImageSource, FilterOperation, ProcessedOutput } from '../types';

export class ImageProcessor {
    private renderer: WebGPURenderer | null = null; // Or a generic Renderer type
    private fallbackController: FallbackController;
    private device: GPUDevice | null = null;

    constructor() {
        this.fallbackController = new FallbackController();
    }

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
     */
    public async initializeRendererWithCanvas(canvas: HTMLCanvasElement): Promise<void> {
        if (!this.renderer) {
            throw new Error('ImageProcessor has not been initialized with a WebGPU device yet, or renderer not created.');
        }
        await this.renderer.initialize(canvas);
        console.log('ImageProcessor's renderer has been initialized with a canvas.');
    }

    public getGPUDevice(): GPUDevice | null {
        return this.device;
    }
} 