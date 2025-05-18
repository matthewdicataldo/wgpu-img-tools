/**
 * Creates a WebGPU render pipeline.
 *
 * @param device - The WebGPU device.
 * @param filterName - The name of the filter (used for labeling the pipeline).
 * @param shaderCode - The WGSL shader code as a string.
 * @param presentationFormat - The texture format of the output target.
 * @returns A configured GPURenderPipeline.
 */
export function createGpuRenderPipeline(
    device: GPUDevice,
    filterName: string,
    shaderCode: string,
    presentationFormat: GPUTextureFormat
): GPURenderPipeline {
    const shaderModule = device.createShaderModule({ code: shaderCode });

    const pipeline = device.createRenderPipeline({
        label: filterName,
        layout: 'auto', // Let WebGPU infer the bind group layout from shaders
        vertex: {
            module: shaderModule,
            entryPoint: 'vs_main', // Standard entry point, ensure shaders use this
        },
        fragment: {
            module: shaderModule,
            entryPoint: 'fs_main', // Standard entry point, ensure shaders use this
            targets: [{ format: presentationFormat }],
        },
        primitive: {
            topology: 'triangle-list',
        },
    });

    console.log(`Pipeline created for filter: ${filterName}`);
    return pipeline;
}

/**
 * Creates a WebGPU bind group for a typical image filter shader.
 *
 * @param device - The GPUDevice.
 * @param pipeline - The GPURenderPipeline to get the layout from (assumes bind group 0).
 * @param sampler - The GPUSampler for texture sampling.
 * @param sourceTextureView - The GPUTextureView of the source image.
 * @returns A configured GPUBindGroup.
 */
export function createGpuBindGroup(
    device: GPUDevice,
    pipeline: GPURenderPipeline,
    sampler: GPUSampler,
    sourceTextureView: GPUTextureView
    // TODO: Add entries for uniform buffers if shaders require them
): GPUBindGroup {
    const bindGroup = device.createBindGroup({
        label: `${pipeline.label}-bindGroup`, // Optional: label for debugging
        layout: pipeline.getBindGroupLayout(0), // Assumes layout for group 0
        entries: [
            { binding: 0, resource: sampler }, // Standard binding for sampler
            { binding: 1, resource: sourceTextureView }, // Standard binding for source texture
            // Add other resources like uniform buffers here if needed by specific filters
            // e.g., { binding: 2, resource: { buffer: uniformBuffer } }
        ],
    });
    return bindGroup;
}

/**
 * Executes a WebGPU render pass, typically for an image filter.
 *
 * @param device - The GPUDevice.
 * @param pipeline - The GPURenderPipeline to use.
 * @param bindGroup - The GPUBindGroup containing resources (sampler, source texture, etc.).
 * @param targetTextureView - The GPUTextureView to render to.
 * @param clearColor - Optional clear color for the target texture. Defaults to transparent black.
 */
export function executeGpuRenderPass(
    device: GPUDevice,
    pipeline: GPURenderPipeline,
    bindGroup: GPUBindGroup,
    targetTextureView: GPUTextureView,
    clearColor: GPUColor = { r: 0.0, g: 0.0, b: 0.0, a: 0.0 } // Default to transparent black
): void {
    const commandEncoder = device.createCommandEncoder({
        label: `${pipeline.label}-commandEncoder`, // Optional: label for debugging
    });

    const renderPassDescriptor: GPURenderPassDescriptor = {
        label: `${pipeline.label}-renderPass`, // Optional: label for debugging
        colorAttachments: [
            {
                view: targetTextureView,
                clearValue: clearColor,
                loadOp: 'clear', // Clears the texture before drawing. Use 'load' to preserve existing content.
                storeOp: 'store', // Stores the result of the render pass.
            },
        ],
    };

    const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);
    passEncoder.setPipeline(pipeline);
    passEncoder.setBindGroup(0, bindGroup); // Assumes bind group 0 for sampler and texture
    // Draw a quad (2 triangles, 6 vertices) to cover the target texture
    // Assumes vertex shader is set up to generate full-screen quad coordinates.
    passEncoder.draw(6, 1, 0, 0);
    passEncoder.end();

    device.queue.submit([commandEncoder.finish()]);
}

// Future utility functions related to WebGPU pipelines can be added here. 