/**
 * wgpu-img-tools - WebGPU-accelerated image processing library
 * 
 * This library provides high-performance image processing using WebGPU
 * with fallbacks to WebGL, WASM, and pure TypeScript.
 * 
 * The API follows data-oriented design principles for optimal performance.
 */

// Core types
export type {
  ImageSource,
  FilterOperation,
  LibraryConfig,
  ProcessedOutput,
  CoreImageData,
  FilterProcessingOptions
} from './types';

// DOD types
export type {
  ProcessingContext,
  BackendType,
  ResourcePool,
  ImageBatch,
  ImageBatchMetadata,
  FilterBatch,
  WorkerPool,
  BackendCapabilities,
  MemoryPool
} from './core/types.dod';

// Filter types
export type {
  Filter,
  GrayscaleFilterOptions
} from './filters/common/types';

// Core processing functions (DOD API)
export {
  applyFilters,
  applySingleFilterInPlace,
  applyFilterBatch
} from './core/filterProcessor';

// DOD Image Loading
export {
  loadImageBatch,
  extractImageFromBatch,
  reserveBatchSpace,
  clearBatch,
  LoadStatus,
  ErrorCode,
  SourceType
} from './core/imageLoader.dod';

// DOD Structure Creation
export {
  createProcessingContext,
  createResourcePool,
  createImageBatch,
  createPerformanceMetrics
} from './core/types.dod';

// Worker Pool Management
export {
  createWorkerPool,
  destroyWorkerPool,
  submitTasks,
  getPoolStatistics,
  createImageDecoderPool
} from './core/workerPool.dod';

// Re-export everything from types for convenience
export * from './types';
export * from './filters/common/types';