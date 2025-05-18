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
    sampler: { sampler: 'filtering' }, // As per TypeGPU documentation for bindGroupLayout entries

    /**
     * The input texture containing the original image data.
     * Defined as a 2D texture with float sampling.
     */
    inputTexture: {
        texture: 'float',
        viewDimension: '2d'
    }, // As per TypeGPU documentation for bindGroupLayout texture entries
} as const;

// The grayscaleResources object itself serves as the bind group layout definition
// for TypeGPU's `createBindGroup` or `tgpu.bindGroupLayout()`.
// An explicit `grayscaleBindGroupLayout` constant with `kind: 'bindGroupLayout'`
// is not typically how layouts are defined before being processed by TypeGPU.

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