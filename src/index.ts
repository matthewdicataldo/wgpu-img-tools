// src/index.ts

// Core
export { ImageProcessor } from './core/imageProcessor';
export { FallbackController } from './core/fallbackController';
export type { PreferredBackend, AvailableBackends } from './core/fallbackController';
export type { ImageProcessorInstance } from './core/ImageProcessorInstance';
export { ChainableImage } from './core/ChainableImage';
// Actual ImageProcessorInstance implementation will be separate
// For now, a placeholder for the initialize function
import { WgpuImageProcessorInstance, ImageProcessorInstance } from './core/ImageProcessorInstance';
import { FallbackController } from './core/fallbackController';
import type { PreferredBackend } from './core/fallbackController';
// TODO: Unused import, commented out for now.
// import { ChainableImage } from './core/ChainableImage';
// TODO: Unused imports (CoreImageData, ImageSource), commented out for now. LibraryConfig is still used.
import { /*CoreImageData, ImageSource,*/ LibraryConfig } from './types';
// TODO: Unused import, commented out for now.
// import { loadImageData } from './core/imageLoader'; // Assuming this will be used

// Filters
export { createGrayscaleFilter } from './filters/grayscale';
export type { GrayscaleFilter } from './filters/grayscale';
export type { GrayscaleFilterOptions, Filter as GenericFilter } from './filters/common/types'; // Renaming to avoid conflict if user defines 'Filter'

// Renderers (optional to export specific renderers, ImageProcessor handles them internally)
// export { WebGPURenderer } from './renderers/webgpu/webgpuRenderer';
// export type { Renderer } from './renderers/webgpu/webgpuRenderer'; // Generic Renderer interface

// Shared Types
export type {
    ImageSource,
    FilterOperation,
    LibraryConfig,
    ProcessedOutput,
    CoreImageData,
} from './types';


/**
 * Initializes the image processing library and returns an ImageProcessorInstance.
 *
 * @remarks
 * This is the main entry point for using the library. It sets up the necessary
 * configurations and returns an instance that can be used to load and process images.
 *
 * @param {LibraryConfig} [config] - Optional configuration for the library.
 * @returns {Promise<ImageProcessorInstance>} A promise that resolves to an
 * {@link ImageProcessorInstance}.
 *
 * @example
 * ```typescript
 * import { initialize } from 'wgpu-img-tools';
 *
 * async function main() {
 *   const processor = await initialize({ preferredBackend: 'webgpu' });
 *   // Now use processor to load images
 * }
 * main();
 * ```
 */
export async function initialize(config?: LibraryConfig): Promise<ImageProcessorInstance> {
  console.log('Initializing WebGPU Image Processing Library with config:', config);

  const fallbackController = new FallbackController();
  const preferredBackendOrder = config?.preferredBackend ? [config.preferredBackend] : undefined;
  const bestBackend = fallbackController.getBestAvailableBackend(preferredBackendOrder as PreferredBackend[] | undefined);

  if (bestBackend === 'webgpu') {
    if (!navigator.gpu) {
      console.error('WebGPU is preferred/available but navigator.gpu is not present.');
      return Promise.reject(new Error('WebGPU not supported by the browser.'));
    }
    try {
      const adapter = await navigator.gpu.requestAdapter();
      if (!adapter) {
        console.error('Failed to get WebGPU adapter.');
        return Promise.reject(new Error('Failed to get WebGPU adapter.'));
      }
      const device = await adapter.requestDevice();
      if (!device) {
        console.error('Failed to get WebGPU device.');
        return Promise.reject(new Error('Failed to get WebGPU device.'));
      }
      console.log('WebGPU backend selected and device acquired.');
      // Pass the original config and the acquired device
      return new WgpuImageProcessorInstance(config || {}, device);
    } catch (error) {
      console.error('Error initializing WebGPU backend:', error);
      return Promise.reject(new Error(`WebGPU initialization failed: ${error instanceof Error ? error.message : String(error)}`));
    }
  } else {
    // For MVP, we only fully support WebGPU.
    // If WebGPU is not chosen or fails, and it was the preference or best available,
    // we reject. Other backends (webgl, wasm, typescript) are not implemented yet.
    console.warn(`Selected backend is '${bestBackend || 'none'}'. Currently, only WebGPU is fully implemented for initialization.`);
    return Promise.reject(new Error(`No suitable and implemented backend found. Best available: ${bestBackend || 'none'}.`));
  }
}

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

console.log('WebGPU Image Processing Library Loaded with new fluent API structure.');