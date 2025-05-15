import type { TGPUBuffer, TGPUTexture, TGPUSampler, TGPUBindGroupLayout, TGPURenderPipeline } from 'typegpu';

// Schema for the resources used by the grayscale filter shader.
// This aligns with the bindings in grayscale.wgsl:
// @group(0) @binding(0) var mySampler: sampler;
// @group(0) @binding(1) var inputTexture: texture_2d<f32>;

export const grayscaleResources = {
    sampler: {
        kind: 'sampler',
        binding: 0,
        // GPUSamplerDescriptor properties can be defined here if needed,
        // otherwise, they can be provided when creating the actual sampler.
        // magFilter: 'linear',
        // minFilter: 'linear',
    } as const satisfies TGPUSampler,
    inputTexture: {
        kind: 'texture',
        binding: 1,
        texture_2d: { sampleType: 'float' }, // Corresponds to texture_2d<f32>
        // GPUSamplerDescriptor: { sampleType: 'float' } // for texture_2d<f32>
        // GPUTextureViewDescriptor properties can be defined here or when creating the view.
        // format: 'rgba8unorm', (This is usually on the texture itself, not the view for binding purposes)
        // dimension: '2d',
    } as const satisfies TGPUTexture,
} as const;

// Define the bind group layout schema based on the resources
export const grayscaleBindGroupLayout: TGPUBindGroupLayout<typeof grayscaleResources> = {
    kind: 'bindGroupLayout',
    entries: grayscaleResources,
} as const;

// Example of how a render pipeline schema might look, incorporating the bind group layout.
// This is a more advanced use and might be simplified or handled directly in pipeline factory for now.
// export const grayscalePipelineLayout = {
//   kind: 'pipelineLayout',
//   bindGroupLayouts: [grayscaleBindGroupLayout],
// } as const;

// export const grayscaleRenderPipeline: TGPURenderPipeline<typeof grayscalePipelineLayout, any, any> = {
//   kind: 'renderPipeline',
//   layout: grayscalePipelineLayout,
//   // Vertex and Fragment shader stages would be defined here too
//   // vertex: { ... },
//   // fragment: { ... },
// };

console.log('TypeGPU schemas for grayscale filter loaded.'); 