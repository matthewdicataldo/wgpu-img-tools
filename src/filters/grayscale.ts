// src/filters/grayscale.ts
import type { Filter, GrayscaleFilterOptions } from './common/types';

/**
 * Constant identifier for the grayscale filter type.
 * Used to identify grayscale operations throughout the library.
 */
export const GRAYSCALE_FILTER_NAME = 'grayscale';

/**
 * Interface representing a grayscale filter operation.
 * 
 * @remarks
 * This filter converts an image to grayscale using a standard luminance formula
 * (0.299 * R + 0.587 * G + 0.114 * B). Any custom options for the filter
 * can be provided via the options property.
 * 
 * @see GrayscaleFilterOptions for available configuration options
 */
export interface GrayscaleFilter extends Filter {
    name: typeof GRAYSCALE_FILTER_NAME;
    options?: GrayscaleFilterOptions;
}

/**
 * Creates a grayscale filter configuration for use with the image processor.
 * 
 * @param options - Optional configuration settings for the grayscale filter
 * @returns A properly formatted GrayscaleFilter object that can be passed to ImageProcessor.applyFilter()
 * 
 * @example
 * ```typescript
 * import { createGrayscaleFilter } from 'wgpu-img-tools';
 * 
 * // Create a grayscale filter with default settings
 * const filter = createGrayscaleFilter();
 * 
 * // Apply the filter
 * const result = await imageProcessor.applyFilter(image, filter);
 * ```
 */
export function createGrayscaleFilter(options?: GrayscaleFilterOptions): GrayscaleFilter {
    return {
        name: GRAYSCALE_FILTER_NAME,
        options,
    };
}

// Placeholder for any CPU-side logic specific to grayscale if needed in the future.
// For instance, validating options or preparing data in a way that is unique
// to this filter before it's handed off to a generic renderer. 