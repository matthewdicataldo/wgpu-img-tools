import type { TGPUBuffer, TGPUTexture, TGPUSampler, TGPUBindGroupLayout, TGPURenderPipeline } from 'typegpu';

/**
 * TypeGPU schema definitions for grayscale filter resources.
 * 
 * @remarks
 * This module defines the TypeGPU schemas for the resources used by the grayscale filter.
 * TypeGPU provides type-safe definitions for WebGPU resources, ensuring that the TypeScript
 * code matches the WGSL shader expectations.
 */

/**
 * Schema for the resources used by the grayscale filter shader.
 * 
 * @remarks
 * This schema aligns with the bindings in grayscale.wgsl:
 * ```wgsl
 * @group(0) @binding(0) var mySampler: sampler;
 * @group(0) @binding(1) var inputTexture: texture_2d<f32>;
 * ```
 * 
 * The schema defines:
 * - A sampler at binding 0
 * - A 2D float texture at binding 1
 * 
 * These resources are used by the shader to sample the input image and
 * convert it to grayscale.
 */
export const grayscaleResources = {
    /**
     * The sampler used to sample the input texture.
     * Default sampler parameters are used (linear filtering).
     */
    sampler: {
        kind: 'sampler',
        binding: 0,
        // GPUSamplerDescriptor properties can be defined here if needed,
        // otherwise, they can be provided when creating the actual sampler.
        // magFilter: 'linear',
        // minFilter: 'linear',
    } as const satisfies TGPUSampler,

    /**
     * The input texture containing the original image data.
     * Defined as a 2D texture with float sampling.
     */
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

/**
 * Bind group layout schema for the grayscale filter.
 * 
 * @remarks
 * This schema defines the layout of the bind group that will be created
 * to bind the sampler and input texture to the grayscale shader.
 * 
 * The schema is derived from the grayscaleResources schema and ensures
 * type safety when creating the actual GPUBindGroupLayout.
 */
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