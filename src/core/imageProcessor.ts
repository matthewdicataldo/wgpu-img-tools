import { FallbackController } from './fallbackController';
import type { WebGPURenderer } from '../renderers/webgpu/webgpuRenderer'; // Assuming this path
import type { ImageSource, FilterOperation } from '../types';

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
                // TODO: Instantiate the specific renderer, e.g., WebGPURenderer
                // this.renderer = new WebGPURenderer(this.device);
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

        // TODO: The texture creation part will be handled by the specific renderer
        // e.g., this.renderer.uploadImage(imageBitmap);
        console.log('Image loaded and ImageBitmap created:', imageBitmap);
        return imageBitmap; // Or perhaps a custom internal representation
    }

    public async applyFilter(
        imageBitmap: ImageBitmap,
        operations: FilterOperation | FilterOperation[]
    ): Promise<ImageBitmap> { // Or ImageData/HTMLCanvasElement
        if (!this.renderer) {
            throw new Error('Renderer not available. Initialize ImageProcessor first.');
        }
        if (!this.device) {
            throw new Error('WebGPU device not available.');
        }

        // TODO: This is a simplified placeholder. Actual implementation will involve:
        // 1. Ensuring texture is created from imageBitmap by the renderer
        // 2. Setting up pipeline(s) for the filter(s)
        // 3. Executing render pass(es)
        // 4. Reading back the processed image data (if needed as ImageBitmap/ImageData)

        console.log('Applying filter(s):', operations, 'to image:', imageBitmap);
        // const processedBitmap = await this.renderer.process(imageBitmap, operations);
        // return processedBitmap;

        // Placeholder return, actual processing will be done by the renderer
        return imageBitmap;
    }

    public getGPUDevice(): GPUDevice | null {
        return this.device;
    }
} 