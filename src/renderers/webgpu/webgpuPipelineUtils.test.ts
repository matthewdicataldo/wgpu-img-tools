import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
    createGpuRenderPipeline,
    createGpuBindGroup,
    executeGpuRenderPass,
} from '../../../src/renderers/webgpu/webgpuPipelineUtils'; // Adjust path

// --- Mocks ---
const mockCreateShaderModule = vi.fn();
const mockCreateRenderPipeline = vi.fn();
const mockGetBindGroupLayout = vi.fn();
const mockCreateBindGroup = vi.fn();
const mockCreateCommandEncoder = vi.fn();
const mockBeginRenderPass = vi.fn();
const mockSetPipeline = vi.fn();
const mockSetBindGroup = vi.fn();
const mockDraw = vi.fn();
const mockEndPass = vi.fn();
const mockFinishEncoder = vi.fn();
const mockSubmit = vi.fn();

const mockGPUDevice: Partial<GPUDevice> = {
    createShaderModule: mockCreateShaderModule,
    createRenderPipeline: mockCreateRenderPipeline,
    createBindGroup: mockCreateBindGroup,
    createCommandEncoder: mockCreateCommandEncoder,
    queue: {
        submit: mockSubmit,
    } as Partial<GPUQueue> as GPUQueue,
};

const mockGPURenderPipeline: Partial<GPURenderPipeline> = {
    getBindGroupLayout: mockGetBindGroupLayout,
    label: 'test-pipeline',
};

const mockGPUSampler: Partial<GPUSampler> = {};
const mockGPUTextureView: Partial<GPUTextureView> = {};
const mockGPUBindGroup: Partial<GPUBindGroup> = {};
const mockGPURenderPassEncoder: Partial<GPURenderPassEncoder> = {
    setPipeline: mockSetPipeline,
    setBindGroup: mockSetBindGroup,
    draw: mockDraw,
    end: mockEndPass,
};
const mockGPUCommandBuffer: Partial<GPUCommandBuffer> = {};

// --- End Mocks ---

describe('WebGPU Pipeline Utilities', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Default mock implementations
        mockCreateShaderModule.mockReturnValue({} as GPUShaderModule);
        mockCreateRenderPipeline.mockReturnValue(mockGPURenderPipeline as GPURenderPipeline);
        mockGetBindGroupLayout.mockReturnValue({} as GPUBindGroupLayout);
        mockCreateBindGroup.mockReturnValue(mockGPUBindGroup as GPUBindGroup);
        mockCreateCommandEncoder.mockReturnValue({
            beginRenderPass: mockBeginRenderPass,
            finish: mockFinishEncoder,
        } as Partial<GPUCommandEncoder> as GPUCommandEncoder);
        mockBeginRenderPass.mockReturnValue(mockGPURenderPassEncoder as GPURenderPassEncoder);
        mockFinishEncoder.mockReturnValue(mockGPUCommandBuffer as GPUCommandBuffer);
    });

    describe('createGpuRenderPipeline', () => {
        it('should create a render pipeline with correct parameters', () => {
            const filterName = 'testFilter';
            const shaderCode = '/* wgsl shader code */';
            const format: GPUTextureFormat = 'rgba8unorm';

            createGpuRenderPipeline(mockGPUDevice as GPUDevice, filterName, shaderCode, format);

            expect(mockCreateShaderModule).toHaveBeenCalledWith({ code: shaderCode });
            expect(mockCreateRenderPipeline).toHaveBeenCalledWith(
                expect.objectContaining({
                    label: filterName,
                    layout: 'auto',
                    vertex: expect.objectContaining({ entryPoint: 'vs_main' }),
                    fragment: expect.objectContaining({
                        entryPoint: 'fs_main',
                        targets: [{ format }],
                    }),
                    primitive: expect.objectContaining({ topology: 'triangle-list' }),
                })
            );
        });
    });

    describe('createGpuBindGroup', () => {
        it('should create a bind group with correct parameters', () => {
            createGpuBindGroup(
                mockGPUDevice as GPUDevice,
                mockGPURenderPipeline as GPURenderPipeline,
                mockGPUSampler as GPUSampler,
                mockGPUTextureView as GPUTextureView
            );

            expect(mockGetBindGroupLayout).toHaveBeenCalledWith(0);
            expect(mockCreateBindGroup).toHaveBeenCalledWith({
                label: `${mockGPURenderPipeline.label}-bindGroup`,
                layout: {}, // Result of getBindGroupLayout mock
                entries: [
                    { binding: 0, resource: mockGPUSampler },
                    { binding: 1, resource: mockGPUTextureView },
                ],
            });
        });
    });

    describe('executeGpuRenderPass', () => {
        it('should execute a render pass with correct commands and parameters', () => {
            const clearColor = { r: 0.1, g: 0.2, b: 0.3, a: 0.4 };
            executeGpuRenderPass(
                mockGPUDevice as GPUDevice,
                mockGPURenderPipeline as GPURenderPipeline,
                mockGPUBindGroup as GPUBindGroup,
                mockGPUTextureView as GPUTextureView,
                clearColor
            );

            expect(mockCreateCommandEncoder).toHaveBeenCalledOnce();
            expect(mockBeginRenderPass).toHaveBeenCalledWith(
                expect.objectContaining({
                    colorAttachments: [
                        expect.objectContaining({
                            view: mockGPUTextureView,
                            clearValue: clearColor,
                            loadOp: 'clear',
                            storeOp: 'store',
                        }),
                    ],
                })
            );
            expect(mockSetPipeline).toHaveBeenCalledWith(mockGPURenderPipeline);
            expect(mockSetBindGroup).toHaveBeenCalledWith(0, mockGPUBindGroup);
            expect(mockDraw).toHaveBeenCalledWith(6, 1, 0, 0);
            expect(mockEndPass).toHaveBeenCalledOnce();
            expect(mockFinishEncoder).toHaveBeenCalledOnce();
            expect(mockSubmit).toHaveBeenCalledWith([mockGPUCommandBuffer]);
        });
    });
}); 