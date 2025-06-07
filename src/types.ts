import { Filter } from './filters/common/types';

/**
 * Defines the allowable types for an image source input to the library.
 *
 * @remarks
 * The library supports multiple input source types for flexibility:
 * - HTMLImageElement: For images already in the DOM
 * - ImageBitmap: For pre-processed image data
 * - File: For user-uploaded files
 * - string: URL path to an image resource
 *
 * @example
 * ```typescript
 * // Using a DOM image element
 * const img = document.getElementById('myImage') as HTMLImageElement;
 * await processor.loadImage(img);
 *
 * // Using a URL string
 * await processor.loadImage('https://example.com/image.jpg');
 * ```
 */
export type ImageSource = HTMLImageElement | ImageBitmap | File | string;

/**
 * Represents a single filter operation to be applied.
 *
 * @remarks
 * FilterOperation aligns with the Filter interface from filters/common/types.
 * Each operation specifies the filter type and any options required for
 * that particular filter (e.g., grayscale, blur, contrast).
 *
 * @example
 * ```typescript
 * // Basic grayscale filter
 * const operation: FilterOperation = { name: 'grayscale' };
 *
 * // Filter with options
 * const operation: FilterOperation = {
 *   name: 'brightness',
 *   options: { level: 1.2 }
 * };
 * ```
 */
export type FilterOperation = Filter;

/**
 * Defines the structure for the library's main configuration options.
 *
 * @remarks
 * This interface allows global configuration of the library behavior.
 * The preferredBackend option determines which rendering backend to use,
 * with fallbacks automatically applied if the preferred backend is unavailable.
 *
 * @example
 * ```typescript
 * const config: LibraryConfig = {
 *   preferredBackend: 'webgpu',
 *   enableBatchProcessing: true,
 *   memoryPoolSize: 10
 * };
 * ```
 */
export interface LibraryConfig {
  preferredBackend?: 'webgpu' | 'webgl' | 'wasm' | 'typescript';
  
  /**
   * Optional parameters to be passed to `navigator.gpu.requestAdapter()`.
   * This allows for fine-grained control over adapter selection, such as
   * requesting a high-performance or low-power GPU.
   *
   * @example
   * ```typescript
   * const config: LibraryConfig = {
   *   preferredBackend: 'webgpu',
   *   gpuRequestAdapterOptions: {
   *     powerPreference: 'high-performance'
   *   }
   * };
   * ```
   */
  gpuRequestAdapterOptions?: GPURequestAdapterOptions;
  
  /**
   * Enable batch processing optimizations for multiple images.
   * When true, the library will use more memory-efficient batch processing.
   */
  enableBatchProcessing?: boolean;
  
  /**
   * Size of the memory pool for texture/buffer reuse.
   * Higher values use more memory but reduce allocations.
   */
  memoryPoolSize?: number;
}

/**
 * Represents the output of a processing operation.
 *
 * @remarks
 * The actual type returned depends on the renderer capabilities and configuration.
 * - ImageBitmap: Common for GPU-based rendering results
 * - ImageData: Raw pixel data for CPU operations or further processing
 * - HTMLCanvasElement: For direct display in the DOM
 *
 * The consumer should check the returned type and handle accordingly.
 *
 * @example
 * ```typescript
 * const result = await processor.applyFilter(image, filter);
 * if (result instanceof ImageBitmap) {
 *   // Handle ImageBitmap result
 * } else if (result instanceof ImageData) {
 *   // Handle ImageData result
 * }
 * ```
 */
export type ProcessedOutput = ImageBitmap | ImageData | HTMLCanvasElement;

/**
 * Represents the core, raw image data structure for data-oriented processing.
 *
 * @remarks
 * This structure holds the essential information about an image's pixel data,
 * dimensions, and format, facilitating its use in pure functions and
 * efficient data pipelines.
 *
 * @example
 * ```typescript
 * const coreImage: CoreImageData = {
 *   data: new Uint8ClampedArray([...]), // Pixel data
 *   width: 1920,
 *   height: 1080,
 *   format: 'rgba8unorm'
 * };
 * ```
 */
export interface CoreImageData {
  data: ArrayBuffer | Uint8ClampedArray;
  width: number;
  height: number;
  format: 'rgba8unorm' | 'bgra8unorm' | string;
}

/**
 * Options for filter processing operations.
 * Supports data-oriented design principles.
 */
export interface FilterProcessingOptions {
  /**
   * Process the image data in-place to avoid allocations.
   * Only works when the input data is a Uint8ClampedArray.
   */
  inPlace?: boolean;
  
  /**
   * Use parallel processing for batch operations.
   * Currently a placeholder for future WebWorker support.
   */
  parallel?: boolean;
  
  /**
   * Progress callback for long-running operations.
   * Called with a value between 0 and 1.
   */
  onProgress?: (progress: number) => void;
}