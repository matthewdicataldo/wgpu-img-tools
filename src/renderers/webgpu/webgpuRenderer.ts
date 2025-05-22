import type { FilterOperation } from '../../types'; // Assuming operations are defined in root types
import type { Filter, GrayscaleFilterOptions } from '../../filters/common/types'; // Added GrayscaleFilterOptions
import { WebGPUPipelineFactory } from './webgpuPipelineFactory';
import grayscaleShader from './shaders/grayscale.wgsl?raw'; // Vite specific way to import raw text
import { WebGPUContextError, WebGPUInitializationError, WebGPUResourceError, UnsupportedFilterError } from '../../core/errors';

export interface Renderer {
    // Common interface for all renderers (WebGPU, WebGL, etc.)
    initialize(canvas: HTMLCanvasElement): Promise<void>;
    uploadImage(imageBitmap: ImageBitmap): Promise<void>;
    process(imageBitmap: ImageBitmap, operations: FilterOperation | FilterOperation[]): Promise<ImageBitmap>; // Or ImageData
    destroy(): void;
    // Allow specific renderers to have update methods
    updateGrayscaleStrength?(newStrength: number): void;
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
    private strengthBuffer: GPUBuffer | null = null; // For grayscale strength

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

        this.canvasElement.width = imageBitmap.width;
        this.canvasElement.height = imageBitmap.height;

        if (this.sourceTexture) {
            this.sourceTexture.destroy();
        }

        this.sourceTexture = this.device.createTexture({
            size: [imageBitmap.width, imageBitmap.height, 1],
            format: 'rgba8unorm', // Standard format for images
            usage: GPUTextureUsage.TEXTURE_BINDING |
                GPUTextureUsage.COPY_DST |
                GPUTextureUsage.RENDER_ATTACHMENT,
        });

        this.device.queue.copyExternalImageToTexture(
            { source: imageBitmap },
            { texture: this.sourceTexture },
            [imageBitmap.width, imageBitmap.height]
        );
        console.log('Image uploaded to WebGPU texture.');
    }

    private async prepareForFilter(filter: Filter): Promise<void> {
        if (!this.device || !this.sampler || !this.sourceTexture || !this.presentationFormat) {
            throw new WebGPUResourceError('Renderer not ready or missing critical resources for preparing filter.');
        }

        let shaderCode = '';
        const bindGroupEntries: GPUBindGroupEntry[] = [
            { binding: 0, resource: this.sampler },
            { binding: 1, resource: this.sourceTexture.createView() },
        ];

        // Clean up existing strength buffer if the new filter is not grayscale or if it's being recreated
        if (filter.name !== 'grayscale' && this.strengthBuffer) {
            this.strengthBuffer.destroy();
            this.strengthBuffer = null;
        }

        if (filter.name === 'grayscale') {
            shaderCode = grayscaleShader;
            
            if (this.strengthBuffer) { // If buffer exists from a previous grayscale op, destroy it before creating new
                this.strengthBuffer.destroy();
            }
            this.strengthBuffer = this.device.createBuffer({
                label: 'grayscale-strength-uniform-buffer',
                size: 4, // One f32
                usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
            });

            const options = filter.options as GrayscaleFilterOptions; // Cast to access strength
            // Default to 1.0 if strength is not provided or not a number
            const strengthValue = typeof options?.strength === 'number' ? options.strength : 1.0;
            this.device.queue.writeBuffer(this.strengthBuffer, 0, new Float32Array([strengthValue]));

            bindGroupEntries.push({ binding: 2, resource: { buffer: this.strengthBuffer } });
        } else {
            // This path is for filters other than grayscale.
            // Ensure shaderCode is set for these other filters if they are to be supported.
            // For now, any other filter type would need its shader code loaded here.
            // Example: if (filter.name === 'sepia') { shaderCode = sepiaShader; }
            // If no specific handling, it will likely fail when creating the pipeline if shaderCode is empty.
            if (!shaderCode) { // If shaderCode wasn't set by a known filter type
                 throw new UnsupportedFilterError(`Shader for filter '${filter.name}' is not available or filter not supported.`);
            }
        }
        
        this.currentPipeline = this.pipelineFactory.createPipeline(filter, shaderCode, this.presentationFormat);
        
        this.currentBindGroup = this.device.createBindGroup({
            layout: this.currentPipeline.getBindGroupLayout(0), 
            entries: bindGroupEntries,
        });
    }
    
    public updateGrayscaleStrength(newStrength: number): void {
        if (!this.device) {
            console.warn('WebGPURenderer: Device not available. Cannot update strength.');
            return;
        }
        if (!this.strengthBuffer) {
            console.warn('WebGPURenderer: Strength buffer not initialized. Ensure grayscale filter is active.');
            return;
        }
        if (this.currentPipeline?.label !== 'grayscale') {
            console.warn('WebGPURenderer: updateGrayscaleStrength called, but current filter is not grayscale.');
        }
        
        const strengthValue = Math.max(0, Math.min(1, newStrength)); 
        this.device.queue.writeBuffer(this.strengthBuffer, 0, new Float32Array([strengthValue]));
    }

    async process(imageBitmap: ImageBitmap, operations: FilterOperation | FilterOperation[]): Promise<ImageBitmap> {
        if (!this.device || !this.context || !this.canvasElement) {
            throw new WebGPUInitializationError('WebGPU Renderer core components not ready for processing.');
        }
        
        const operationList = Array.isArray(operations) ? operations : [operations];
        if (operationList.length === 0) {
             console.warn('No operations provided to process.');
             return imageBitmap;
        }

        const filterToApply = operationList[0] as Filter; 
        await this.prepareForFilter(filterToApply); // This will set up pipeline and bind group

        if (!this.currentPipeline || !this.currentBindGroup) { // Check after prepareForFilter
            throw new WebGPUResourceError('WebGPU Renderer pipeline or bind group not prepared after prepareForFilter call.');
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
        passEncoder.setPipeline(this.currentPipeline);
        passEncoder.setBindGroup(0, this.currentBindGroup);
        passEncoder.draw(6, 1, 0, 0); 
        passEncoder.end();

        this.device.queue.submit([commandEncoder.finish()]);
        console.log(`Filter '${filterToApply.name}' applied and rendered to canvas.`);

        return imageBitmap;
    }

    destroy(): void {
        this.sourceTexture?.destroy();
        this.outputTexture?.destroy();
        this.strengthBuffer?.destroy(); 
        this.strengthBuffer = null;
        this.sourceTexture = null;
        this.outputTexture = null;
        this.context = null; 
        this.canvasElement = null; 
        console.log('WebGPU Renderer resources destroyed and references cleared.');
    }
}
