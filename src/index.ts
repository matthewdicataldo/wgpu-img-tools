// src/index.ts

// Core
export { ImageProcessor } from './core/imageProcessor';
export { FallbackController } from './core/fallbackController';
export type { PreferredBackend, AvailableBackends } from './core/fallbackController';

// Filters
export { createGrayscaleFilter } from './filters/grayscale';
export type { GrayscaleFilter, GrayscaleFilterOptions } from './filters/grayscale';
export type { Filter as GenericFilter } from './filters/common/types'; // Renaming to avoid conflict if user defines 'Filter'

// Renderers (optional to export specific renderers, ImageProcessor handles them internally)
// export { WebGPURenderer } from './renderers/webgpu/webgpuRenderer';
// export type { Renderer } from './renderers/webgpu/webgpuRenderer'; // Generic Renderer interface

// Shared Types
export type {
    ImageSource,
    FilterOperation,
    LibraryConfig,
    ProcessedOutput,
} from './types';

// Utilities
export { simpleUID, log } from './utils/common';

// Example of a high-level convenience function if desired
// import { ImageProcessor } from './core/imageProcessor';
// import { LibraryConfig, ImageSource, FilterOperation, ProcessedOutput } from './types';

// export async function processImage(
//   source: ImageSource,
//   operations: FilterOperation | FilterOperation[],
//   config?: LibraryConfig
// ): Promise<ProcessedOutput> {
//   const processor = new ImageProcessor();
//   await processor.initialize(config?.preferredBackend);
//   const imageBitmap = await processor.loadImage(source);
//   const result = await processor.applyFilter(imageBitmap, operations);
//   // Assuming applyFilter will eventually return one of ProcessedOutput types
//   return result as ProcessedOutput; 
// }

console.log('WebGPU Image Processing Library Loaded'); 