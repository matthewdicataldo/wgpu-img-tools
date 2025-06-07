/**
 * Core Data-Oriented Design types for wgpu-img-tools
 * 
 * These structures are designed for:
 * - Minimal allocations
 * - Cache-friendly access patterns
 * - Batch processing efficiency
 * - SIMD optimization potential
 */

// ============================================
// Processing Context - Replaces class instances
// ============================================

/**
 * Global processing context containing all persistent state
 */
export interface ProcessingContext {
  backend: BackendType;
  device: GPUDevice | null;
  resources: ResourcePool;
  capabilities: BackendCapabilities;
  metrics: PerformanceMetrics;
}

export type BackendType = 'webgpu' | 'webgl' | 'wasm' | 'typescript';

/**
 * Resource pool for reusing GPU resources
 */
export interface ResourcePool {
  textures: TexturePool;
  buffers: BufferPool;
  pipelines: PipelineCache;
  samplers: SamplerCache;
}

export interface TexturePool {
  available: GPUTexture[];
  inUse: Map<number, GPUTexture>;
  maxSize: number;
  totalAllocated: number;
}

export interface BufferPool {
  available: GPUBuffer[];
  inUse: Map<number, GPUBuffer>;
  maxSize: number;
  totalAllocated: number;
}

export interface PipelineCache {
  pipelines: Map<string, GPURenderPipeline>;
  shaders: Map<string, GPUShaderModule>;
  lastAccess: Map<string, number>;
}

export interface SamplerCache {
  samplers: Map<string, GPUSampler>;
}

// ============================================
// Image Data Structures - Structure of Arrays
// ============================================

/**
 * Batch of images stored in Structure of Arrays format
 * for better cache utilization and SIMD processing
 */
export interface ImageBatch {
  // Image dimensions
  widths: Uint32Array;
  heights: Uint32Array;
  
  // Pixel data - all images contiguous
  pixelData: Float32Array;
  
  // Offsets into pixelData for each image
  offsets: Uint32Array;
  
  // Format for each image
  formats: Uint8Array; // 0=rgba8, 1=bgra8, etc
  
  // Number of images in batch
  count: number;
  
  // Total capacity
  capacity: number;
}

/**
 * Metadata for image batch operations
 */
export interface ImageBatchMetadata {
  sourceTypes: Uint8Array; // 0=file, 1=url, 2=bitmap, etc
  loadStatus: Uint8Array;  // 0=pending, 1=loading, 2=loaded, 3=error
  errorCodes: Uint16Array;
  timestamps: Float64Array;
}

// ============================================
// Filter Operations - Data-Oriented
// ============================================

/**
 * Batch of filter operations for efficient processing
 */
export interface FilterBatch {
  // Filter types (indices into filter registry)
  types: Uint16Array;
  
  // Parameter data - all parameters contiguous
  floatParams: Float32Array;
  intParams: Int32Array;
  
  // Offsets into parameter arrays
  floatOffsets: Uint32Array;
  intOffsets: Uint32Array;
  
  // Number of operations
  count: number;
}

/**
 * Filter registry for looking up implementations
 */
export interface FilterRegistry {
  filters: Map<string, FilterImplementation>;
  nameToIndex: Map<string, number>;
  indexToName: Map<number, string>;
}

export interface FilterImplementation {
  name: string;
  index: number;
  
  // CPU implementations
  processCPU?: (data: Float32Array, width: number, height: number, params: FilterParams) => void;
  processCPUSIMD?: (data: Float32Array, width: number, height: number, params: FilterParams) => void;
  
  // GPU implementations
  shaderSource?: string;
  pipelineDescriptor?: GPURenderPipelineDescriptor;
  
  // Parameter info
  paramCount: { float: number; int: number };
}

export interface FilterParams {
  floats: Float32Array;
  ints: Int32Array;
}

// ============================================
// Command Buffers - For GPU batching
// ============================================

/**
 * Command buffer for batching GPU operations
 */
export interface CommandBatch {
  commands: Command[];
  encoders: GPUCommandEncoder[];
  resources: number[]; // Indices into resource pool
  
  // Timing info
  timestamps: Float64Array;
  
  // Current state
  currentEncoder: number;
  commandCount: number;
}

export interface Command {
  type: CommandType;
  resourceIndices: Uint32Array;
  parameters: ArrayBuffer;
}

export type CommandType = 'draw' | 'compute' | 'copy' | 'clear';

// ============================================
// Performance Metrics
// ============================================

export interface PerformanceMetrics {
  // Timing data (rolling window)
  frameTimes: Float32Array;
  processingTimes: Float32Array;
  uploadTimes: Float32Array;
  downloadTimes: Float32Array;
  
  // Counters
  totalFrames: number;
  totalImages: number;
  totalBytes: number;
  
  // Current index in rolling arrays
  currentIndex: number;
  windowSize: number;
}

// ============================================
// Backend Capabilities
// ============================================

export interface BackendCapabilities {
  webgpu: WebGPUCapabilities | null;
  webgl: WebGLCapabilities | null;
  wasm: WASMCapabilities | null;
  cpu: CPUCapabilities;
}

export interface WebGPUCapabilities {
  available: boolean;
  adapter: GPUAdapter | null;
  features: Set<string>;
  limits: Record<string, number>;
}

export interface WebGLCapabilities {
  available: boolean;
  version: 1 | 2;
  extensions: Set<string>;
  maxTextureSize: number;
}

export interface WASMCapabilities {
  available: boolean;
  simd: boolean;
  threads: boolean;
  memory: number;
}

export interface CPUCapabilities {
  cores: number;
  simd: boolean;
  littleEndian: boolean;
}

// ============================================
// Worker Pool for Parallelization
// ============================================

export interface WorkerPool {
  workers: Worker[];
  
  // Task management
  taskQueue: Uint32Array;     // Task IDs
  taskStatus: Uint8Array;     // 0=pending, 1=running, 2=complete
  taskWorker: Uint8Array;     // Which worker has the task
  
  // Results
  results: Map<number, ArrayBuffer>;
  
  // Pool state
  activeCount: number;
  maxWorkers: number;
}

export interface WorkerTask {
  id: number;
  type: 'decode' | 'process' | 'encode';
  input: ArrayBuffer;
  parameters: ArrayBuffer;
}

// ============================================
// Memory Management
// ============================================

export interface MemoryPool {
  // Pre-allocated buffers of various sizes
  small: ArrayBuffer[];   // 256KB
  medium: ArrayBuffer[];  // 1MB
  large: ArrayBuffer[];   // 4MB
  huge: ArrayBuffer[];    // 16MB
  
  // Usage tracking
  allocated: Map<number, ArrayBuffer>;
  free: Map<number, ArrayBuffer[]>;
  
  // Statistics
  totalAllocated: number;
  peakUsage: number;
  allocationCount: number;
}

// ============================================
// Utility Functions for Creating Structures
// ============================================

export function createProcessingContext(backend: BackendType): ProcessingContext {
  return {
    backend,
    device: null,
    resources: createResourcePool(),
    capabilities: detectCapabilities(),
    metrics: createPerformanceMetrics()
  };
}

export function createResourcePool(): ResourcePool {
  return {
    textures: {
      available: [],
      inUse: new Map(),
      maxSize: 100,
      totalAllocated: 0
    },
    buffers: {
      available: [],
      inUse: new Map(),
      maxSize: 100,
      totalAllocated: 0
    },
    pipelines: {
      pipelines: new Map(),
      shaders: new Map(),
      lastAccess: new Map()
    },
    samplers: {
      samplers: new Map()
    }
  };
}

export function createImageBatch(capacity: number): ImageBatch {
  const pixelCapacity = capacity * 512 * 512 * 4; // Assume average 512x512 RGBA
  
  return {
    widths: new Uint32Array(capacity),
    heights: new Uint32Array(capacity),
    pixelData: new Float32Array(pixelCapacity),
    offsets: new Uint32Array(capacity),
    formats: new Uint8Array(capacity),
    count: 0,
    capacity
  };
}

export function createPerformanceMetrics(windowSize = 60): PerformanceMetrics {
  return {
    frameTimes: new Float32Array(windowSize),
    processingTimes: new Float32Array(windowSize),
    uploadTimes: new Float32Array(windowSize),
    downloadTimes: new Float32Array(windowSize),
    totalFrames: 0,
    totalImages: 0,
    totalBytes: 0,
    currentIndex: 0,
    windowSize
  };
}

export function detectCapabilities(): BackendCapabilities {
  return {
    webgpu: detectWebGPU(),
    webgl: detectWebGL(),
    wasm: detectWASM(),
    cpu: detectCPU()
  };
}

function detectWebGPU(): WebGPUCapabilities | null {
  if (typeof navigator === 'undefined' || !navigator.gpu) {
    return null;
  }
  
  return {
    available: true,
    adapter: null,
    features: new Set(),
    limits: {}
  };
}

function detectWebGL(): WebGLCapabilities | null {
  if (typeof document === 'undefined') {
    return null;
  }
  
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
  
  if (!gl) {
    return null;
  }
  
  return {
    available: true,
    version: gl instanceof WebGL2RenderingContext ? 2 : 1,
    extensions: new Set(),
    maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE)
  };
}

function detectWASM(): WASMCapabilities | null {
  if (typeof WebAssembly === 'undefined') {
    return null;
  }
  
  return {
    available: true,
    simd: typeof WebAssembly.validate === 'function',
    threads: typeof SharedArrayBuffer !== 'undefined',
    memory: 256 * 1024 * 1024 // 256MB default
  };
}

function detectCPU(): CPUCapabilities {
  return {
    cores: typeof navigator !== 'undefined' ? navigator.hardwareConcurrency || 4 : 4,
    simd: false, // Would need feature detection
    littleEndian: new Uint8Array(new Uint16Array([1]).buffer)[0] === 1
  };
}