import type { Filter } from './filters/common/types';

/**
 * Defines the allowable types for an image source input to the library.
 */
export type ImageSource = HTMLImageElement | ImageBitmap | File | string; // string for URL

/**
 * Represents a single filter operation to be applied.
 * This could be a simple filter name or a more complex object with options.
 * For now, aligning with the Filter interface from filters/common/types.
 */
export type FilterOperation = Filter; // Example: { name: 'grayscale'; options?: GrayscaleFilterOptions }

/**
 * Defines the structure for the library's main configuration options.
 */
export interface LibraryConfig {
    preferredBackend?: 'webgpu' | 'webgl' | 'wasm' | 'typescript';
    // Add other global library configuration options here
}

/**
 * Represents the output of a processing operation, which could be various types
 * depending on the use case and renderer capabilities.
 */
export type ProcessedOutput = ImageBitmap | ImageData | HTMLCanvasElement;

// Add other globally used types and interfaces for the library here. 