/**
 * Example usage of the Data-Oriented Design API for image processing
 */

import { applyFilters, applyFilterBatch, applySingleFilterInPlace } from '../core/filterProcessor';
import { CoreImageData, FilterOperation } from '../types';

// Example 1: In-place processing for maximum performance
async function example1_inPlaceProcessing() {
  console.log('Example 1: In-place processing');
  
  // Create a sample image
  const imageData: CoreImageData = {
    data: new Uint8ClampedArray(256 * 256 * 4), // 256x256 RGBA image
    width: 256,
    height: 256,
    format: 'rgba8unorm'
  };
  
  // Fill with random colors
  const data = imageData.data as Uint8ClampedArray;
  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.floor(Math.random() * 256);     // R
    data[i + 1] = Math.floor(Math.random() * 256); // G
    data[i + 2] = Math.floor(Math.random() * 256); // B
    data[i + 3] = 255;                             // A
  }
  
  console.log('Processing in-place (no allocations)...');
  const start = performance.now();
  
  // Process in-place - modifies the original data
  await applyFilters(
    imageData,
    { name: 'grayscale' },
    undefined,
    { inPlace: true }
  );
  
  const end = performance.now();
  console.log(`Completed in ${(end - start).toFixed(2)}ms\n`);
}

// Example 2: Batch processing multiple images
function example2_batchProcessing() {
  console.log('Example 2: Batch processing');
  
  // Create 10 sample images
  const images: CoreImageData[] = Array(10).fill(null).map((_, index) => ({
    data: new Uint8ClampedArray(128 * 128 * 4), // 128x128 RGBA images
    width: 128,
    height: 128,
    format: 'rgba8unorm' as const
  }));
  
  // Fill with different colors for each image
  images.forEach((img, index) => {
    const data = img.data as Uint8ClampedArray;
    const hue = (index * 36) % 360; // Different hue for each image
    
    for (let i = 0; i < data.length; i += 4) {
      // Simple HSV to RGB conversion (simplified)
      data[i] = Math.floor(128 + 127 * Math.cos(hue * Math.PI / 180));     // R
      data[i + 1] = Math.floor(128 + 127 * Math.cos((hue - 120) * Math.PI / 180)); // G
      data[i + 2] = Math.floor(128 + 127 * Math.cos((hue + 120) * Math.PI / 180)); // B
      data[i + 3] = 255; // A
    }
  });
  
  console.log('Processing 10 images in batch...');
  const start = performance.now();
  
  // Process all images efficiently
  const results = applyFilterBatch(images, { name: 'grayscale' });
  
  const end = performance.now();
  console.log(`Processed ${results.length} images in ${(end - start).toFixed(2)}ms`);
  console.log(`Average: ${((end - start) / results.length).toFixed(2)}ms per image\n`);
}

// Example 3: Direct low-level API for maximum control
function example3_lowLevelAPI() {
  console.log('Example 3: Low-level API usage');
  
  // Create raw data buffer
  const width = 512;
  const height = 512;
  const data = new Uint8ClampedArray(width * height * 4);
  
  // Create gradient image
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      data[idx] = (x / width) * 255;     // R: horizontal gradient
      data[idx + 1] = (y / height) * 255; // G: vertical gradient
      data[idx + 2] = 128;                // B: constant
      data[idx + 3] = 255;                // A: opaque
    }
  }
  
  console.log('Applying grayscale filter directly...');
  const start = performance.now();
  
  // Direct in-place processing - no wrapper objects
  applySingleFilterInPlace(data, width, height, { name: 'grayscale' });
  
  const end = performance.now();
  console.log(`Completed in ${(end - start).toFixed(2)}ms`);
  
  // Calculate memory usage
  const pixelCount = width * height;
  const memoryUsed = pixelCount * 4; // RGBA bytes
  console.log(`Memory used: ${(memoryUsed / 1024 / 1024).toFixed(2)}MB (no additional allocations)\n`);
}

// Example 4: Chaining multiple operations efficiently
async function example4_chainedOperations() {
  console.log('Example 4: Chaining operations');
  
  const imageData: CoreImageData = {
    data: new Uint8ClampedArray(256 * 256 * 4),
    width: 256,
    height: 256,
    format: 'rgba8unorm'
  };
  
  // Fill with test pattern
  const data = imageData.data as Uint8ClampedArray;
  for (let i = 0; i < data.length; i += 4) {
    data[i] = 255;     // R
    data[i + 1] = 128; // G
    data[i + 2] = 0;   // B
    data[i + 3] = 255; // A
  }
  
  const operations: FilterOperation[] = [
    { name: 'grayscale' },
    // Future filters can be added here
    // { name: 'brightness', options: { level: 1.2 } },
    // { name: 'contrast', options: { level: 1.1 } }
  ];
  
  console.log('Applying multiple filters in sequence...');
  const start = performance.now();
  
  // All operations are applied to the same buffer
  await applyFilters(imageData, operations, undefined, { inPlace: true });
  
  const end = performance.now();
  console.log(`Applied ${operations.length} filters in ${(end - start).toFixed(2)}ms\n`);
}

// Performance comparison
async function performanceComparison() {
  console.log('=== Performance Comparison ===\n');
  
  const size = 1024; // 1024x1024 image
  const imageData: CoreImageData = {
    data: new Uint8ClampedArray(size * size * 4),
    width: size,
    height: size,
    format: 'rgba8unorm'
  };
  
  // Fill with random data
  const data = imageData.data as Uint8ClampedArray;
  for (let i = 0; i < data.length; i++) {
    data[i] = Math.floor(Math.random() * 256);
  }
  
  // Test 1: With allocations (traditional approach)
  console.log('Traditional approach (with allocations):');
  let totalTime = 0;
  const iterations = 10;
  
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    await applyFilters(imageData, { name: 'grayscale' }, undefined, { inPlace: false });
    totalTime += performance.now() - start;
  }
  
  const avgWithAlloc = totalTime / iterations;
  console.log(`Average time: ${avgWithAlloc.toFixed(2)}ms`);
  console.log(`Memory allocated per operation: ${(size * size * 4 / 1024 / 1024).toFixed(2)}MB`);
  
  // Test 2: DOD approach (in-place)
  console.log('\nDOD approach (in-place):');
  totalTime = 0;
  
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    applySingleFilterInPlace(data, size, size, { name: 'grayscale' });
    totalTime += performance.now() - start;
  }
  
  const avgInPlace = totalTime / iterations;
  console.log(`Average time: ${avgInPlace.toFixed(2)}ms`);
  console.log(`Memory allocated per operation: 0MB`);
  
  console.log(`\nPerformance improvement: ${(avgWithAlloc / avgInPlace).toFixed(2)}x faster`);
  console.log(`Memory saved: ${(iterations * size * size * 4 / 1024 / 1024).toFixed(2)}MB`);
}

// Run all examples
async function runExamples() {
  await example1_inPlaceProcessing();
  example2_batchProcessing();
  example3_lowLevelAPI();
  await example4_chainedOperations();
  await performanceComparison();
}

// Execute if running directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runExamples().catch(console.error);
}