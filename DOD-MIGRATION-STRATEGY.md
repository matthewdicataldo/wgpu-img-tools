# Data-Oriented Design Migration Strategy

## Overview

This document outlines the strategy for migrating the wgpu-img-tools codebase from Object-Oriented Programming (OOP) to Data-Oriented Design (DOD), with a focus on parallelization opportunities.

## Current State Analysis

### OOP Components to Migrate

Based on the codebase analysis, the following OOP components need migration:

1. **ImageProcessor** (class)
   - Manages renderer lifecycle
   - Handles image loading
   - Coordinates filter application

2. **WebGPURenderer** (class)
   - Canvas context management
   - Texture/resource management
   - Pipeline creation and execution

3. **FallbackController** (class)
   - Backend detection
   - Device acquisition
   - Fallback logic

4. **WebGPUPipelineFactory** (class)
   - Pipeline creation
   - Shader module management

5. **ChainableImage** (class)
   - Fluent API for image manipulation
   - State management

## Migration Strategy

### Phase 1: Core Data Structures

Replace classes with data structures and pure functions:

```typescript
// Instead of classes, use typed structures
interface ProcessingContext {
  device: GPUDevice | null;
  backend: 'webgpu' | 'webgl' | 'wasm' | 'typescript';
  resources: ResourcePool;
}

interface ResourcePool {
  textures: GPUTexture[];
  buffers: GPUBuffer[];
  pipelines: Map<string, GPURenderPipeline>;
  lastUsed: Map<string, number>;
}

interface ImageBatch {
  data: Float32Array;      // All pixel data contiguous
  dimensions: Uint32Array; // [width, height] pairs
  offsets: Uint32Array;    // Offset into data for each image
  count: number;
}
```

### Phase 2: Function-Based Architecture

Convert methods to pure functions operating on data:

```typescript
// Image Loading (DOD)
export function loadImageBatch(
  sources: ArrayBuffer[],
  output: ImageBatch,
  options: LoadOptions
): void;

// WebGPU Processing (DOD)
export function processImagesGPU(
  context: ProcessingContext,
  input: ImageBatch,
  operations: FilterOperation[],
  output: ImageBatch
): void;

// Fallback Detection (DOD)
export function detectBackends(): BackendCapabilities;
export function selectBackend(
  capabilities: BackendCapabilities,
  preference: string[]
): string;
```

### Phase 3: Parallelization Opportunities

#### 1. **Image Loading Parallelization**
```typescript
// Parallel image decoding using Web Workers
interface ImageDecoderPool {
  workers: Worker[];
  taskQueue: DecodingTask[];
  results: Map<number, ArrayBuffer>;
}

export function createDecoderPool(size: number): ImageDecoderPool;
export function decodeImagesParallel(
  pool: ImageDecoderPool,
  sources: ArrayBuffer[],
  callback: (results: ImageBatch) => void
): void;
```

#### 2. **GPU Command Buffer Batching**
```typescript
// Batch multiple operations into single GPU submission
interface CommandBatch {
  encoders: GPUCommandEncoder[];
  operations: FilterOperation[];
  textures: GPUTexture[];
}

export function createCommandBatch(
  device: GPUDevice,
  size: number
): CommandBatch;

export function submitCommandBatch(
  device: GPUDevice,
  batch: CommandBatch
): void;
```

#### 3. **CPU SIMD Processing**
```typescript
// SIMD-optimized CPU fallback
export function processPixelsSIMD(
  data: Float32Array,
  width: number,
  height: number,
  operation: FilterOperation
): void;
```

#### 4. **WebWorker Pipeline**
```typescript
// Distribute work across workers
interface WorkerPool {
  workers: Worker[];
  tasks: ProcessingTask[];
  results: Float32Array[];
}

export function distributeWork(
  pool: WorkerPool,
  images: ImageBatch,
  operation: FilterOperation
): Promise<ImageBatch>;
```

## Implementation Plan

### Step 1: Create Core Data Structures (Week 1)
- [ ] Define all data structures in `src/core/types.dod.ts`
- [ ] Create memory pool implementations
- [ ] Design batch processing structures
- [ ] Implement structure-of-arrays patterns

### Step 2: Implement Image Loading DOD (Week 1-2)
- [ ] Replace `imageLoader.ts` with `imageLoaderDOD.ts`
- [ ] Implement batch loading functions
- [ ] Add parallel decoding support
- [ ] Create benchmark tests

### Step 3: Convert WebGPU Renderer (Week 2-3)
- [ ] Replace class with processing functions
- [ ] Implement resource pooling
- [ ] Add command buffer batching
- [ ] Optimize texture management

### Step 4: Implement Fallback System (Week 3)
- [ ] Convert detection to pure functions
- [ ] Create capability tables
- [ ] Implement selection algorithm
- [ ] Add performance metrics

### Step 5: Add Parallelization (Week 4)
- [ ] Implement WebWorker pool
- [ ] Add SIMD optimizations
- [ ] Create task distribution
- [ ] Implement progress tracking

### Step 6: Migration & Testing (Week 4-5)
- [ ] Migrate existing code to use new APIs
- [ ] Create compatibility layer (temporary)
- [ ] Comprehensive testing
- [ ] Performance benchmarking

## Key Design Patterns

### 1. **Structure of Arrays (SoA)**
```typescript
// Instead of Array of Structures
interface ImageAoS {
  width: number;
  height: number;
  data: Uint8ClampedArray;
}[]

// Use Structure of Arrays
interface ImageSoA {
  widths: Uint32Array;
  heights: Uint32Array;
  data: Float32Array; // All image data contiguous
  offsets: Uint32Array;
}
```

### 2. **Zero-Copy Operations**
```typescript
// Reuse buffers instead of allocating
export function processInPlace(
  data: Float32Array,
  operation: FilterOperation
): void;
```

### 3. **Batch Processing**
```typescript
// Process multiple items together
export function processBatch(
  items: Float32Array,
  count: number,
  stride: number,
  operation: FilterOperation
): void;
```

### 4. **Command Pattern for GPU**
```typescript
interface GPUCommand {
  type: 'draw' | 'compute' | 'copy';
  resources: number[]; // Indices into resource pool
  parameters: ArrayBuffer;
}

export function executeCommands(
  device: GPUDevice,
  commands: GPUCommand[],
  resources: ResourcePool
): void;
```

## Performance Targets

1. **Memory Allocation**: < 1MB per 1000 images processed
2. **Throughput**: > 60 FPS for real-time preview (512x512)
3. **Latency**: < 16ms for single image processing
4. **Batch Efficiency**: > 90% GPU utilization
5. **Worker Scaling**: Linear up to 8 workers

## Migration Rules

1. **No Classes**: Replace all classes with data + functions
2. **No Allocations**: Reuse memory wherever possible
3. **Batch First**: Design APIs for batch processing
4. **Pure Functions**: No side effects except explicit output
5. **Explicit State**: Pass all state as parameters
6. **Measure Everything**: Add performance metrics

## Compatibility During Migration

### Temporary Adapter Pattern
```typescript
// Temporary adapter for gradual migration
export class OOPAdapter {
  private context: ProcessingContext;
  
  constructor() {
    this.context = createProcessingContext();
  }
  
  // Delegate to DOD functions
  async processImage(source: ImageSource): Promise<ImageBitmap> {
    const batch = createImageBatch(1);
    await loadImageBatch([source], batch, {});
    processImagesGPU(this.context, batch, [], batch);
    return extractImageFromBatch(batch, 0);
  }
}
```

## Success Metrics

1. **Performance**: 3-5x improvement in throughput
2. **Memory**: 80% reduction in allocations
3. **Scalability**: Linear scaling with worker count
4. **Code Size**: 30% reduction in bundle size
5. **API Simplicity**: Fewer concepts to learn

## Next Steps

1. Review and approve migration strategy
2. Set up performance benchmarking infrastructure
3. Create first DOD module (image loader)
4. Establish coding standards for DOD
5. Begin incremental migration