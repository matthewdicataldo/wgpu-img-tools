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

// Re-export everything from types for convenience
export * from './types';
export * from './filters/common/types';