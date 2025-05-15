/**
 * Represents a generic filter operation.
 */
export interface Filter {
    name: string; // Name of the filter, e.g., 'grayscale', 'blur'
    options?: Record<string, any>; // Filter-specific options
}

/**
 * Defines the structure for options specific to the Grayscale filter.
 * For grayscale, there might not be options, but this serves as an example.
 */
export interface GrayscaleFilterOptions {
    // Example: intensity?: number; // Range 0.0 to 1.0
}

// Add other common filter-related types and interfaces here 