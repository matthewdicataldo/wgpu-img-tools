import type { CoreImageData, FilterOperation } from '../types';
import { applySingleFilter as applySingleFilterOperation } from './filterProcessor';
// Placeholder for actual image loading
// import { loadImageData } from './imageLoader'; // Assuming this will be used by ImageProcessorInstance.load

/**
 * Represents an image that can have a chain of filter operations applied to it.
 *
 * @remarks
 * An instance of `ChainableImage` is typically obtained by calling `load()` on an
 * {@link ImageProcessorInstance}. It allows for a fluent API where multiple filter
 * operations can be chained together before finally rendering the result.
 *
 * Internally, it manages {@link CoreImageData} which is transformed by each
 * filter operation.
 *
 * @example
 * ```typescript
 * const chain = await processor.load('path/to/image.png');
 * const finalImageBitmap = await chain
 *   .filter({ name: 'grayscale' })
 *   .filter({ name: 'brightness', options: { level: 1.5 } })
 *   .render();
 * ```
 */
export class ChainableImage {
  private currentImageData: CoreImageData;

  /**
   * Creates an instance of ChainableImage.
   * This constructor is typically used internally by the library.
   * @param {CoreImageData} initialImageData - The initial core image data.
   */
  constructor(initialImageData: CoreImageData) {
    this.currentImageData = initialImageData;
  }

  /**
   * Applies a filter operation to the image.
   *
   * @remarks
   * This method modifies the internal {@link CoreImageData} by applying the
   * specified filter. It returns `this` to allow for method chaining.
   * For MVP, this performs an immediate transformation.
   *
   * @param {FilterOperation} operation - The filter operation to apply.
   * @returns {ChainableImage} The current `ChainableImage` instance for chaining.
   *
   * @example
   * ```typescript
   * chainableImage
   *   .filter({ name: 'sepia' })
   *   .filter({ name: 'contrast', options: { level: 0.8 } });
   * ```
   */
  public filter(operation: FilterOperation): ChainableImage {
    // MVP: Immediate transformation.
    // In a more advanced version, this might queue operations.
    // The actual filter logic is now in `filterProcessor.ts`.
    this.currentImageData = applySingleFilterOperation(this.currentImageData, operation);
    return this;
  }

  /**
   * Renders the processed image to an {@link ImageBitmap}.
   *
   * @remarks
   * This method finalizes all applied filter operations and converts the
   * resulting {@link CoreImageData} into an `ImageBitmap`.
   * It internally creates an offscreen canvas (or `HTMLCanvasElement` if `OffscreenCanvas`
   * is not available or suitable), draws the `CoreImageData` to it, and then
   * uses `createImageBitmap()` to generate the `ImageBitmap`.
   *
   * Potential errors during canvas context creation or `createImageBitmap`
   * will be thrown.
   *
   * @returns {Promise<ImageBitmap>} A promise that resolves to the final `ImageBitmap`.
   * @throws {Error} If canvas context cannot be obtained or `createImageBitmap` fails.
   *
   * @example
   * ```typescript
   * try {
   *   const bitmap = await chainableImage.render();
   *   // Now 'bitmap' can be drawn to a canvas or used elsewhere.
   * } catch (error) {
   *   console.error("Failed to render image:", error);
   * }
   * ```
   */
 public async render(): Promise<ImageBitmap> {
   const { data, width, height } = this.currentImageData;

   // Ensure data is Uint8ClampedArray for ImageData constructor
   const clampedData = data instanceof Uint8ClampedArray
     ? data
     : new Uint8ClampedArray(data);

   const imageDataForCanvas = new ImageData(clampedData, width, height);
   
   let canvas: OffscreenCanvas | HTMLCanvasElement;
   let ctx: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D | null;

   try {
     // Prefer OffscreenCanvas if available (better for workers, performance)
     if (typeof OffscreenCanvas !== 'undefined') {
       canvas = new OffscreenCanvas(width, height);
       ctx = canvas.getContext('2d') as OffscreenCanvasRenderingContext2D | null;
     } else {
       // Fallback to HTMLCanvasElement for environments like older browsers or Node.js without canvas polyfill for OffscreenCanvas
       canvas = document.createElement('canvas');
       canvas.width = width;
       canvas.height = height;
       ctx = canvas.getContext('2d');
     }

     if (!ctx) {
       throw new Error('Failed to get 2D rendering context from canvas. Ensure the environment supports Canvas API.');
     }
     
     ctx.putImageData(imageDataForCanvas, 0, 0);
     return createImageBitmap(canvas);
   } catch (error) {
     console.error('Error during ChainableImage.render():', error);
     throw new Error(`Failed to render image: ${error instanceof Error ? error.message : String(error)}`);
   }
 }

  // The private applySingleFilter method is no longer needed here,
  // as the logic has been moved to filterProcessor.ts

  /**
   * Gets the current internal CoreImageData.
   * Primarily for testing or internal use.
   * @returns {CoreImageData} The current image data.
   */
  public getCoreImageData(): CoreImageData {
    return this.currentImageData;
  }
}