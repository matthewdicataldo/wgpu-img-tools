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
// PreferredBackend is already exported from fallbackController.ts and re-exported below.
// import type { PreferredBackend } from './core/fallbackController';
// TODO: Unused import, commented out for now.
// import { ChainableImage } from './core/ChainableImage';
// TODO: Unused imports (CoreImageData, ImageSource), commented out for now. LibraryConfig is still used.
import type { LibraryConfig } from './types'; // Use 'type' import
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
 * This is the main entry point for using the library. It detects available backends,
 * selects the best one based on preference (defaulting to WebGPU if available),
 * and initializes the appropriate processor instance.
 * For the MVP, only the WebGPU backend is fully supported for initialization.
 * If WebGPU is not available or fails to initialize, the promise will be rejected.
 *
 * @param {LibraryConfig} [config] - Optional configuration for the library.
 *   This can include `preferredBackend` to suggest a backend and
 *   `gpuRequestAdapterOptions` for WebGPU adapter configuration.
 * @returns {Promise<ImageProcessorInstance>} A promise that resolves to an
 *   {@link ImageProcessorInstance} if successful, or rejects with an error.
 *
 * @example
 * ```typescript
 * import { initialize, LibraryConfig } from 'wgpu-img-tools';
 *
 * async function startApp() {
 *   try {
 *     const processor = await initialize({ preferredBackend: 'webgpu' });
 *     console.log('Image processor initialized successfully!');
 *     // Use processor to load and process images
 *     const image = await processor.load('path/to/your/image.png');
 *     // ...
 *   } catch (error) {
 *     console.error('Failed to initialize image processor:', error);
 *   }
 * }
 * startApp();
 * ```
 */
export async function initialize(config?: LibraryConfig): Promise<ImageProcessorInstance> {
  console.log('Initializing Image Processing Library with config:', config);

  const fallbackController = new FallbackController();
  // FallbackController constructor already calls detectAvailableBackends.

  const targetBackend = fallbackController.getBestAvailableBackend(
    config?.preferredBackend ? [config.preferredBackend] : undefined
  );

  if (targetBackend === 'webgpu') {
    console.log('Attempting to initialize WebGPU backend...');
    const gpuDevice = await fallbackController.getWebGPUContext(config?.gpuRequestAdapterOptions);

    if (gpuDevice) {
      console.log('WebGPU device acquired successfully.');
      // Pass the original config and the acquired device
      return new WgpuImageProcessorInstance(config || {}, gpuDevice);
    } else {
      const message = 'WebGPU backend initialization failed: Could not acquire GPUDevice.';
      console.error(message);
      // Even if WebGPU was preferred, if it fails, for MVP we reject.
      return Promise.reject(new Error(message + ` Preferred/Best available: ${targetBackend}. Full support for other backends is not yet implemented in MVP.`));
    }
  } else {
    // For MVP, if WebGPU is not the best available (or fails as handled above), we reject.
    const message = `WebGPU is not the best available backend. Preferred/Best available: ${targetBackend || 'none'}.`;
    console.warn(message + ' Full support for other backends is not yet implemented in MVP.');
    return Promise.reject(new Error(message + ' Full support for other backends is not yet implemented in MVP.'));
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