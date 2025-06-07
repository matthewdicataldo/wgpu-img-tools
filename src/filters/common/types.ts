/**
 * Represents a generic filter operation that can be applied to an image.
 *
 * @remarks
 * This interface serves as the base for all filter types in the library.
 * Each specific filter type (e.g., GrayscaleFilter, BlurFilter) extends
 * this interface and provides its own typed options.
 *
 * Filter implementations are responsible for handling their specific options
 * and providing the appropriate shader or processing logic.
 *
 * @example
 * ```typescript
 * // A basic filter without options
 * const filter: Filter = { name: 'invert' };
 *
 * // A filter with options
 * const filter: Filter = {
 *   name: 'blur',
 *   options: { radius: 5 }
 * };
 * ```
 */
export interface Filter {
  /**
   * Unique identifier for the filter type (e.g., 'grayscale', 'blur')
   * Used to dispatch to the appropriate processing implementation.
   */
  name: string;
  
  /**
   * Filter-specific options that control the behavior of the filter.
   * The structure varies depending on the filter type.
   */
  options?: Record<string, any>;
}

/**
 * Defines the structure for options specific to the Grayscale filter.
 *
 * @remarks
 * For the basic grayscale filter, there might not be required options,
 * but this interface allows for future extensions such as custom weights
 * for the RGB-to-grayscale conversion formula.
 *
 * The standard luminance formula (0.299 * R + 0.587 * G + 0.114 * B)
 * is used by default when no custom weights are specified.
 *
 * @example
 * ```typescript
 * // Using default grayscale (standard luminance formula)
 * const options: GrayscaleFilterOptions = {};
 *
 * // A future extension might support custom weights
 * const options: GrayscaleFilterOptions = {
 *   weights: { r: 0.3, g: 0.6, b: 0.1 }
 * };
 * ```
 */
export interface GrayscaleFilterOptions {
  /**
   * Custom weights for RGB channels in grayscale conversion.
   * If not provided, standard luminance weights are used.
   */
  weights?: {
    r: number;
    g: number;
    b: number;
  };
}