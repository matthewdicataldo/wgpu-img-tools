/**
 * Utility functions for image processing operations.
 * 
 * @remarks
 * This module provides utility functions for common image processing tasks.
 * These functions are focused on data manipulation rather than rendering,
 * and are designed to work efficiently with various image data formats.
 * 
 * Current functions:
 * - getDimensions: Extract width and height from various image types
 * 
 * Future utilities may include:
 * - Converting between image data formats (e.g., ImageData to ArrayBuffer)
 * - More advanced dimension calculations (resizing, aspect ratio)
 * - Color space conversions (if not handled by shaders)
 * - Data layout transformations for optimal GPU upload
 */

/**
 * Gets the dimensions (width and height) from various image types.
 * 
 * @param image - The image object to extract dimensions from
 * @returns An object containing the width and height of the image
 * 
 * @example
 * ```typescript
 * // Get dimensions from an image element
 * const img = document.getElementById('myImage') as HTMLImageElement;
 * const { width, height } = getDimensions(img);
 * console.log(`Image size: ${width}x${height}`);
 * 
 * // Get dimensions from an ImageBitmap
 * const bitmap = await createImageBitmap(file);
 * const dimensions = getDimensions(bitmap);
 * ```
 */
export function getDimensions(image: HTMLImageElement | ImageBitmap | ImageData) {
    return { width: image.width, height: image.height };
}

// Add more utility functions as needed. 