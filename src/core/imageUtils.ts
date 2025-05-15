/**
 * Placeholder for image utility functions.
 * This could include functions for:
 * - Converting between image data formats (e.g., ImageData to ArrayBuffer).
 * - Basic image dimension calculations.
 * - Color space conversions (if not handled by shaders).
 */

export function getDimensions(image: HTMLImageElement | ImageBitmap | ImageData) {
    return { width: image.width, height: image.height };
}

// Add more utility functions as needed. 