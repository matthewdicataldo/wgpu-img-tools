import type { ImageSource, CoreImageData } from '../types';

/**
 * Loads an image from various source types and converts it into a standardized CoreImageData structure.
 * This function is pure and does not depend on any external state (like an ImageProcessor instance or GPUDevice).
 *
 * @param source - The image source (File, HTMLImageElement, ImageBitmap, or URL string).
 * @returns A promise that resolves to a CoreImageData object.
 * @throws Error if the image cannot be loaded or the source type is unsupported.
 */
export async function loadImageData(source: ImageSource): Promise<CoreImageData> {
    let imageBitmap: ImageBitmap;

    // 1. Convert various sources to ImageBitmap
    if (source instanceof ImageBitmap) {
        imageBitmap = source;
    } else if (source instanceof HTMLImageElement) {
        if (!source.complete || source.naturalWidth === 0) { // naturalWidth check for broken images
            await new Promise((resolve, reject) => {
                source.onload = resolve;
                source.onerror = () => reject(new Error('Failed to load image element'));
            });
        }
        imageBitmap = await createImageBitmap(source);
    } else if (source instanceof File) {
        imageBitmap = await createImageBitmap(source);
    } else if (typeof source === 'string') { // Assuming URL
        try {
            const response = await fetch(source);
            if (!response.ok) {
                throw new Error(`Failed to fetch image from URL: ${source}, status: ${response.status}`);
            }
            const blob = await response.blob();
            imageBitmap = await createImageBitmap(blob);
        } catch (error) {
            console.error('Error fetching or creating ImageBitmap from URL:', error);
            throw error;
        }
    } else {
        // TypeScript should ensure 'source' is never at this point if all types are handled.
        // If 'source' could be something else, this throw handles it at runtime.
        // const _exhaustiveCheck: never = source; // This was causing an unused variable error.
        throw new Error(`Unsupported image source type: ${typeof source}`);
    }

    // 2. Convert ImageBitmap to CoreImageData (using offscreen canvas)
    const { width, height } = imageBitmap;

    // Ensure canvas is not 0x0, which can cause issues
    if (width === 0 || height === 0) {
        throw new Error('ImageBitmap has zero width or height.');
    }

    // Use try-catch for canvas operations as they can fail (e.g., too large)
    try {
        const canvas = new OffscreenCanvas(width, height);
        const ctx = canvas.getContext('2d');

        if (!ctx) {
            throw new Error('Failed to get OffscreenCanvas 2D context');
        }

        ctx.drawImage(imageBitmap, 0, 0);
        const imageData = ctx.getImageData(0, 0, width, height);

        // Close the ImageBitmap to free up resources if the method exists (browser-specific)
        if (typeof imageBitmap.close === 'function') {
            imageBitmap.close();
        }

        return {
            data: imageData.data, // This is a Uint8ClampedArray
            width,
            height,
            format: 'rgba8unorm', // ImageData from 2D context is always RGBA8
        };
    } catch (error) {
        console.error('Error converting ImageBitmap to CoreImageData:', error);
        // It might be useful to close the imageBitmap here too if it wasn't closed successfully above
        if (imageBitmap && typeof imageBitmap.close === 'function') {
            try {
                imageBitmap.close();
            } catch (closeError) {
                console.error('Error closing ImageBitmap during error handling:', closeError);
            }
        }
        throw error; // Re-throw the original conversion error
    }
} 