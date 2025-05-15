// src/filters/grayscale.ts
import type { Filter, GrayscaleFilterOptions } from './common/types';

export const GRAYSCALE_FILTER_NAME = 'grayscale';

/**
 * Definition for the Grayscale filter.
 */
export interface GrayscaleFilter extends Filter {
    name: typeof GRAYSCALE_FILTER_NAME;
    options?: GrayscaleFilterOptions;
}

/**
 * Creates a Grayscale filter configuration.
 * @param options - Optional configuration for the grayscale filter.
 * @returns GrayscaleFilter object.
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