// src/renderers/webgpu/shaders/grayscale.wgsl

// Vertex Shader
struct VertexOutput {
    @builtin(position) position : vec4<f32>,
    @location(0) tex_coord : vec2<f32>,
}

@vertex
fn vs_main(@builtin(vertex_index) vertex_index : u32) -> VertexOutput {
    var pos = array<vec2<f32>, 6>(
        vec2<f32>(-1.0,  1.0),  // Top-left
        vec2<f32>(-1.0, -1.0),  // Bottom-left
        vec2<f32>( 1.0,  1.0),  // Top-right

        vec2<f32>( 1.0,  1.0),  // Top-right (repeated for second triangle)
        vec2<f32>(-1.0, -1.0),  // Bottom-left (repeated)
        vec2<f32>( 1.0, -1.0)   // Bottom-right
    );

    var uvs = array<vec2<f32>, 6>(
        vec2<f32>(0.0, 0.0), // Top-left
        vec2<f32>(0.0, 1.0), // Bottom-left
        vec2<f32>(1.0, 0.0), // Top-right

        vec2<f32>(1.0, 0.0), // Top-right (repeated)
        vec2<f32>(0.0, 1.0), // Bottom-left (repeated)
        vec2<f32>(1.0, 1.0)  // Bottom-right
    );

    var output : VertexOutput;
    output.position = vec4<f32>(pos[vertex_index], 0.0, 1.0);
    output.tex_coord = uvs[vertex_index];
    return output;
}

// Fragment Shader
@group(0) @binding(0) var mySampler: sampler;
@group(0) @binding(1) var inputTexture: texture_2d<f32>;

@fragment
fn fs_main(@location(0) tex_coord : vec2<f32>) -> @location(0) vec4<f32> {
    let original_color = textureSample(inputTexture, mySampler, tex_coord);
    let gray = original_color.r * 0.299 + original_color.g * 0.587 + original_color.b * 0.114;
    return vec4<f32>(gray, gray, gray, original_color.a);
} 