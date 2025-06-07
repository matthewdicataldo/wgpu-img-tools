import { CoreImageData, FilterOperation } from '../types';

/**
 * Applies filters to image data with minimal allocations.
 * Supports both in-place and copy operations.
 */
export async function applyFilters(
  inputImageData: CoreImageData,
  operations: FilterOperation | FilterOperation[],
  device?: GPUDevice,
  options?: { inPlace?: boolean }
): Promise<CoreImageData> {
  const ops = Array.isArray(operations) ? operations : [operations];
  
  // Only allocate if not processing in-place
  let workingData: Uint8ClampedArray;
  if (options?.inPlace && inputImageData.data instanceof Uint8ClampedArray) {
    workingData = inputImageData.data;
  } else {
    workingData = new Uint8ClampedArray(inputImageData.data);
  }

  // Process all operations on the same buffer
  for (const operation of ops) {
    applySingleFilterInPlace(workingData, inputImageData.width, inputImageData.height, operation);
  }

  return {
    data: workingData,
    width: inputImageData.width,
    height: inputImageData.height,
    format: inputImageData.format
  };
}

/**
 * Applies a single filter operation in-place for better memory efficiency.
 * This follows DOD principles by:
 * 1. Operating on raw data arrays
 * 2. No allocations
 * 3. Cache-friendly linear access
 * 4. Batch-friendly signature
 */
export function applySingleFilterInPlace(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  operation: FilterOperation
): void {
  const pixelCount = width * height;
  
  switch (operation.name) {
    case 'grayscale': {
      // Process 4 pixels at a time for better cache usage
      const batchSize = 4;
      const batchPixelCount = Math.floor(pixelCount / batchSize) * batchSize;
      
      // Main loop - process in batches
      for (let i = 0; i < batchPixelCount * 4; i += batchSize * 4) {
        // Unroll loop for better performance
        for (let j = 0; j < batchSize; j++) {
          const idx = i + j * 4;
          const gray = Math.round(
            0.299 * data[idx] +
            0.587 * data[idx + 1] +
            0.114 * data[idx + 2]
          );
          data[idx] = gray;
          data[idx + 1] = gray;
          data[idx + 2] = gray;
          // Alpha channel (idx + 3) remains unchanged
        }
      }
      
      // Handle remaining pixels
      for (let i = batchPixelCount * 4; i < pixelCount * 4; i += 4) {
        const gray = Math.round(
          0.299 * data[i] +
          0.587 * data[i + 1] +
          0.114 * data[i + 2]
        );
        data[i] = gray;
        data[i + 1] = gray;
        data[i + 2] = gray;
      }
      break;
    }
    
    default:
      console.warn(`Unsupported filter: ${operation.name}`);
  }
}

/**
 * Batch processing function for multiple images.
 * This is a more advanced DOD pattern for processing multiple images efficiently.
 */
export function applyFilterBatch(
  images: CoreImageData[],
  operation: FilterOperation,
  options?: { parallel?: boolean }
): CoreImageData[] {
  if (!images.length) return [];
  
  // Pre-allocate output array
  const results = new Array(images.length);
  
  // Process each image
  for (let i = 0; i < images.length; i++) {
    const img = images[i];
    const outputData = new Uint8ClampedArray(img.data);
    
    applySingleFilterInPlace(
      outputData,
      img.width,
      img.height,
      operation
    );
    
    results[i] = {
      data: outputData,
      width: img.width,
      height: img.height,
      format: img.format
    };
  }
  
  return results;
}