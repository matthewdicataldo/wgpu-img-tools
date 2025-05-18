import type { FilterOperation } from '../../types'; // Assuming operations are defined in root types
import type { Filter } from '../../filters/common/types';
import { WebGPUPipelineFactory } from './webgpuPipelineFactory';
import grayscaleShader from './shaders/grayscale.wgsl?raw'; // Vite specific way to import raw text
import { WebGPUContextError, WebGPUInitializationError, WebGPUResourceError, UnsupportedFilterError } from '../../core/errors';

export interface Renderer {
    // Common interface for all renderers (WebGPU, WebGL, etc.)
    initialize(canvas: HTMLCanvasElement): Promise<void>;
    uploadImage(imageBitmap: ImageBitmap): Promise<void>;
    process(imageBitmap: ImageBitmap, operations: FilterOperation | FilterOperation[]): Promise<ImageBitmap>; // Or ImageData
    destroy(): void;
}

export class WebGPURenderer implements Renderer {
    private device: GPUDevice;
    private context: GPUCanvasContext | null = null;
    private presentationFormat: GPUTextureFormat | null = null;
    private pipelineFactory: WebGPUPipelineFactory;

    private sourceTexture: GPUTexture | null = null;
    private outputTexture: GPUTexture | null = null; // For multi-pass or if canvas is not direct target
    private sampler: GPUSampler | null = null;
    private currentPipeline: GPURenderPipeline | null = null;
    private currentBindGroup: GPUBindGroup | null = null;
    private canvasElement: HTMLCanvasElement | null = null;

    constructor(device: GPUDevice) {
        this.device = device;
        this.pipelineFactory = new WebGPUPipelineFactory(device);
    }

    async initialize(canvas: HTMLCanvasElement): Promise<void> {
        this.canvasElement = canvas;
        this.context = this.canvasElement.getContext('webgpu');
        if (!this.context) {
            console.error('WebGPU Error: Failed to get WebGPU rendering context from the canvas element. Ensure the browser supports WebGPU and it is enabled.');
            throw new WebGPUContextError('Failed to get WebGPU context from canvas. Ensure the browser supports WebGPU and it is enabled.');
        }

        this.presentationFormat = navigator.gpu.getPreferredCanvasFormat();
        this.context.configure({
            device: this.device,
            format: this.presentationFormat,
            alphaMode: 'premultiplied',
        });

        this.sampler = this.device.createSampler({
            magFilter: 'linear',
            minFilter: 'linear',
        });

        console.log('WebGPU Renderer initialized with canvas.');
    }

    async uploadImage(imageBitmap: ImageBitmap): Promise<void> {
        if (!this.device || !this.canvasElement) {
            throw new WebGPUInitializationError('WebGPU Renderer not initialized or canvas not set. Call initialize() first.');
        }

        // Ensure canvas is sized correctly before creating texture
        // This might be better handled by the ImageProcessor or application logic
        this.canvasElement.width = imageBitmap.width;
        this.canvasElement.height = imageBitmap.height;

        if (this.sourceTexture) {
            this.sourceTexture.destroy();
        }

        this.sourceTexture = this.device.createTexture({
            size: [imageBitmap.width, imageBitmap.height, 1],
            format: 'rgba8unorm',
            usage: GPUTextureUsage.TEXTURE_BINDING |
                GPUTextureUsage.COPY_DST |
                GPUTextureUsage.RENDER_ATTACHMENT, // If it can be a render target itself
        });

        this.device.queue.copyExternalImageToTexture(
            { source: imageBitmap },
            { texture: this.sourceTexture },
            [imageBitmap.width, imageBitmap.height]
        );
        console.log('Image uploaded to WebGPU texture.');

        // Prepare for rendering (e.g. a grayscale filter by default or first in chain)
        // This is a simplification; pipeline and bind group should be managed per operation.
        // await this.prepareForFilter({ name: 'grayscale' }); // Example filter
    }

    private async prepareForFilter(filter: Filter): Promise<void> {
        if (!this.device || !this.sampler || !this.sourceTexture || !this.presentationFormat) {
            throw new WebGPUResourceError('Renderer not ready or missing critical resources (device, sampler, sourceTexture, or presentationFormat) for preparing filter.');
        }

        let shaderCode = '';
        if (filter.name === 'grayscale') {
            shaderCode = grayscaleShader;
        }
        // TODO: Add more shaders for other filters
        else {
            throw new UnsupportedFilterError(filter.name);
        }

        this.currentPipeline = this.pipelineFactory.createPipeline(filter, shaderCode, this.presentationFormat);

        this.currentBindGroup = this.device.createBindGroup({
            layout: this.currentPipeline.getBindGroupLayout(0),
            entries: [
                { binding: 0, resource: this.sampler },
                { binding: 1, resource: this.sourceTexture.createView() },
            ],
        });
    }

    async process(imageBitmap: ImageBitmap, operations: FilterOperation | FilterOperation[]): Promise<ImageBitmap> {
        if (!this.device || !this.context || !this.canvasElement) {
            throw new WebGPUInitializationError('WebGPU Renderer core components (device, context, canvas) not ready for processing.');
        }
        if (!this.currentPipeline || !this.currentBindGroup) {
            throw new WebGPUResourceError('WebGPU Renderer pipeline or bind group not prepared for processing. Ensure a filter has been prepared.');
        }

        // For simplicity, this example only handles a single FilterOperation that is a simple Filter.
        // A more robust implementation would iterate through operations, manage intermediate textures, etc.
        const operationList = Array.isArray(operations) ? operations : [operations];

        if (operationList.length !== 1 || !operationList[0].name) {
            // For now, only support a single, simple filter like grayscale defined by its name
            console.warn('Current process implementation only supports a single filter operation like {name: \'grayscale\'}.');
            // Fallback: prepare for grayscale if not already done
            if (!this.currentPipeline || !this.currentBindGroup || this.currentPipeline.label !== 'grayscale') {
                await this.prepareForFilter({ name: 'grayscale' });
            }
        } else {
            // Assuming the first operation is the one we want to apply directly to the canvas
            const filterToApply = operationList[0] as Filter;
            await this.prepareForFilter(filterToApply);
        }

        const commandEncoder = this.device.createCommandEncoder();
        const textureView = this.context.getCurrentTexture().createView();

        const renderPassDescriptor: GPURenderPassDescriptor = {
            colorAttachments: [{
                view: textureView,
                clearValue: { r: 0.0, g: 0.0, b: 0.0, a: 0.0 },
                loadOp: 'clear',
                storeOp: 'store',
            }],
        };

        const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);
        passEncoder.setPipeline(this.currentPipeline); // Assumes pipeline is ready for the current filter
        passEncoder.setBindGroup(0, this.currentBindGroup); // Assumes bind group is ready
        passEncoder.draw(6, 1, 0, 0);
        passEncoder.end();

        this.device.queue.submit([commandEncoder.finish()]);
        console.log('Filter applied and rendered to canvas.');

        // To return an ImageBitmap, we'd need to read back from the texture/canvas.
        // This is a complex operation and might not always be desired if rendering to canvas is the goal.
        // For now, returning the input as a placeholder.
        // A full implementation would involve: device.queue.copyTextureToBuffer, then buffer.mapAsync, then creating ImageBitmap/ImageData.
        return imageBitmap;
    }

    destroy(): void {
        this.sourceTexture?.destroy();
        this.outputTexture?.destroy();
        // Any other GPU resources should be destroyed here.
        console.log('WebGPU Renderer resources destroyed.');
    }
} 