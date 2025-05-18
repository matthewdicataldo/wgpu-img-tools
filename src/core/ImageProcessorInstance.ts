import type { ImageSource, LibraryConfig } from '../types';
import { ChainableImage } from './ChainableImage';

/**
 * @interface ImageProcessorInstance
 * @description Represents an instance of the image processor, capable of loading images
 * and initiating processing chains.
 *
 * @example
 * ```typescript
 * import { initialize } from 'wgpu-img-tools'; // Assuming initialize is the entry point
 *
 * const config: LibraryConfig = { preferredBackend: 'webgpu' };
 * const processor: ImageProcessorInstance = await initialize(config);
 * const chainableImage = await processor.load('path/to/image.png');
 * ```
 */
export interface ImageProcessorInstance {
  /**
   * Loads an image from the specified source.
   *
   * @remarks
   * This method takes an {@link ImageSource} (URL string, HTMLImageElement, File, or ImageBitmap)
   * and prepares it for processing. Internally, it will convert the input
   * into a standardized {@link CoreImageData} format.
   *
   * @param {ImageSource} source - The image source to load.
   * @returns {Promise<ChainableImage>} A promise that resolves to a {@link ChainableImage}
   * instance, ready for filter application.
   *
   * @example
   * ```typescript
   * const imageFromFile = await processor.load(myFileObject);
   * const imageFromUrl = await processor.load('https://example.com/image.jpg');
   * ```
   */
  load(source: ImageSource): Promise<ChainableImage>;

  // Potentially other methods for the instance in the future, e.g.,
  // - getConfig(): LibraryConfig
  // - cleanup(): Promise<void>
}

/**
 * Concrete implementation of the ImageProcessorInstance.
 * This class handles the actual image loading and processing orchestration.
 */
export class WgpuImageProcessorInstance implements ImageProcessorInstance {
  private device: GPUDevice | null = null;
  // private config: LibraryConfig; // Store config if needed for other methods

  /**
   * Initializes the WgpuImageProcessorInstance.
   * @param {LibraryConfig} _config - The library configuration (currently unused here but kept for API consistency).
   * @param {GPUDevice | null} device - The WebGPU device, or null if WebGPU is not used/available.
   */
  constructor(_config: LibraryConfig, device: GPUDevice | null) {
    // this.config = _config; // Store if needed
    this.device = device;
    if (this.device) {
      console.log('WgpuImageProcessorInstance initialized with WebGPU device.');
    } else {
      console.log('WgpuImageProcessorInstance initialized without WebGPU device (fallback or error).');
    }
  }

  /**
   * Loads an image from the specified source using the pure loadImageData function
   * and returns a ChainableImage.
   *
   * @param {ImageSource} source - The image source to load.
   * @returns {Promise<ChainableImage>} A promise that resolves to a {@link ChainableImage}
   * instance.
   */
  public async load(source: ImageSource): Promise<ChainableImage> {
    // Dynamically import loadImageData to potentially help with tree-shaking
    // if imageLoader.ts has other exports not always needed, or for cleaner separation.
    // However, for simplicity and directness, a static import at the top is also fine.
    // For this implementation, let's assume a static import is preferred for clarity.
    const { loadImageData } = await import('./imageLoader');
    const coreImageData = await loadImageData(source);
    return new ChainableImage(coreImageData);
  }
}