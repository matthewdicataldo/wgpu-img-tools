/**
 * Example: Parallel Image Loading with DOD
 * 
 * Demonstrates:
 * - Batch loading with worker pool
 * - Zero-allocation processing
 * - Performance comparison vs sequential
 */

import { loadImageBatch, extractImageFromBatch } from '../core/imageLoader.dod';
import { createImageBatch } from '../core/types.dod';
import { createImageDecoderPool, destroyWorkerPool, getPoolStatistics } from '../core/workerPool.dod';
import { applyFilterBatch } from '../core/filterProcessor';
import type { ImageBatch, ImageBatchMetadata, WorkerPool } from '../core/types.dod';

// Example 1: Sequential vs Parallel Loading
async function compareLoadingPerformance() {
  console.log('=== Loading Performance Comparison ===\n');
  
  // Generate test image URLs (in real app, would be actual URLs)
  const imageUrls = Array(20).fill(0).map((_, i) => 
    `https://picsum.photos/512/512?random=${i}`
  );
  
  // Test 1: Sequential loading
  console.log('Sequential Loading:');
  const sequentialBatch = createImageBatch(20);
  const sequentialMetadata: ImageBatchMetadata = {
    sourceTypes: new Uint8Array(20),
    loadStatus: new Uint8Array(20),
    errorCodes: new Uint16Array(20),
    timestamps: new Float64Array(20)
  };
  
  const sequentialStart = performance.now();
  await loadImageBatch(imageUrls, sequentialBatch, sequentialMetadata, {
    parallel: false
  });
  const sequentialTime = performance.now() - sequentialStart;
  
  console.log(`Time: ${sequentialTime.toFixed(2)}ms`);
  console.log(`Images loaded: ${sequentialBatch.count}`);
  console.log(`Average per image: ${(sequentialTime / sequentialBatch.count).toFixed(2)}ms\n`);
  
  // Test 2: Parallel loading
  console.log('Parallel Loading (4 workers):');
  const workerPool = createImageDecoderPool(4);
  const parallelBatch = createImageBatch(20);
  const parallelMetadata: ImageBatchMetadata = {
    sourceTypes: new Uint8Array(20),
    loadStatus: new Uint8Array(20),
    errorCodes: new Uint16Array(20),
    timestamps: new Float64Array(20)
  };
  
  const parallelStart = performance.now();
  await loadImageBatch(imageUrls, parallelBatch, parallelMetadata, {
    parallel: true,
    workerPool
  });
  const parallelTime = performance.now() - parallelStart;
  
  console.log(`Time: ${parallelTime.toFixed(2)}ms`);
  console.log(`Images loaded: ${parallelBatch.count}`);
  console.log(`Average per image: ${(parallelTime / parallelBatch.count).toFixed(2)}ms`);
  console.log(`Speedup: ${(sequentialTime / parallelTime).toFixed(2)}x\n`);
  
  // Show worker utilization
  const stats = getPoolStatistics(workerPool);
  console.log('Worker Pool Statistics:');
  console.log(`Total tasks: ${stats.totalTasks}`);
  console.log(`Completed: ${stats.completedTasks}`);
  console.log(`Failed: ${stats.failedTasks}`);
  console.log(`Worker utilization: ${Array.from(stats.workerUtilization).map(u => `${(u * 100).toFixed(0)}%`).join(', ')}`);
  
  destroyWorkerPool(workerPool);
}

// Example 2: Batch Processing Pipeline
async function batchProcessingPipeline() {
  console.log('\n=== Batch Processing Pipeline ===\n');
  
  // Create batches for different stages
  const rawBatch = createImageBatch(50);
  const processedBatch = createImageBatch(50);
  
  // Metadata for tracking
  const metadata: ImageBatchMetadata = {
    sourceTypes: new Uint8Array(50),
    loadStatus: new Uint8Array(50),
    errorCodes: new Uint16Array(50),
    timestamps: new Float64Array(50)
  };
  
  // Stage 1: Generate test images
  console.log('Stage 1: Generating test images...');
  const sources = Array(50).fill(0).map(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;
    
    // Random gradient
    const gradient = ctx.createLinearGradient(0, 0, 256, 256);
    gradient.addColorStop(0, `hsl(${Math.random() * 360}, 70%, 50%)`);
    gradient.addColorStop(1, `hsl(${Math.random() * 360}, 70%, 50%)`);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 256, 256);
    
    return canvas;
  });
  
  // Stage 2: Load in parallel
  console.log('Stage 2: Loading images in parallel...');
  const pool = createImageDecoderPool();
  const loadStart = performance.now();
  
  await loadImageBatch(sources, rawBatch, metadata, {
    parallel: true,
    workerPool: pool
  });
  
  const loadTime = performance.now() - loadStart;
  console.log(`Loaded ${rawBatch.count} images in ${loadTime.toFixed(2)}ms`);
  
  // Stage 3: Apply filters in batch
  console.log('Stage 3: Applying grayscale filter to batch...');
  const processStart = performance.now();
  
  // Extract as CoreImageData array for filter processing
  const coreImages = [];
  for (let i = 0; i < rawBatch.count; i++) {
    const width = rawBatch.widths[i];
    const height = rawBatch.heights[i];
    const offset = rawBatch.offsets[i];
    const pixelCount = width * height * 4;
    
    // Convert back to Uint8ClampedArray for filter
    const data = new Uint8ClampedArray(pixelCount);
    for (let j = 0; j < pixelCount; j++) {
      data[j] = Math.round(rawBatch.pixelData[offset + j] * 255);
    }
    
    coreImages.push({
      data,
      width,
      height,
      format: 'rgba8unorm' as const
    });
  }
  
  const processed = applyFilterBatch(coreImages, { name: 'grayscale' });
  
  const processTime = performance.now() - processStart;
  console.log(`Processed ${processed.length} images in ${processTime.toFixed(2)}ms`);
  console.log(`Average: ${(processTime / processed.length).toFixed(2)}ms per image`);
  
  // Stage 4: Memory statistics
  console.log('\nStage 4: Memory Usage Analysis');
  const totalPixels = rawBatch.widths.reduce((sum, w, i) => sum + w * rawBatch.heights[i], 0);
  const memoryUsed = totalPixels * 4 * 4; // 4 channels × 4 bytes per float
  console.log(`Total pixels: ${totalPixels.toLocaleString()}`);
  console.log(`Memory used: ${(memoryUsed / 1024 / 1024).toFixed(2)}MB`);
  console.log(`Memory per image: ${(memoryUsed / rawBatch.count / 1024).toFixed(2)}KB`);
  
  destroyWorkerPool(pool);
}

// Example 3: Real-time Processing Simulation
async function realtimeProcessing() {
  console.log('\n=== Real-time Processing Simulation ===\n');
  
  const FRAME_COUNT = 60; // Simulate 60 frames
  const BATCH_SIZE = 4;   // Process 4 frames at a time
  
  // Create batches
  const batches: ImageBatch[] = [];
  for (let i = 0; i < Math.ceil(FRAME_COUNT / BATCH_SIZE); i++) {
    batches.push(createImageBatch(BATCH_SIZE));
  }
  
  // Frame timing
  const frameTimes: number[] = [];
  
  console.log(`Processing ${FRAME_COUNT} frames in batches of ${BATCH_SIZE}...`);
  
  for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
    const batch = batches[batchIndex];
    const frameStart = performance.now();
    
    // Simulate frame generation
    const frames = [];
    const remainingFrames = Math.min(BATCH_SIZE, FRAME_COUNT - batchIndex * BATCH_SIZE);
    
    for (let i = 0; i < remainingFrames; i++) {
      const canvas = document.createElement('canvas');
      canvas.width = 1920;
      canvas.height = 1080;
      const ctx = canvas.getContext('2d')!;
      
      // Simulate video frame
      ctx.fillStyle = `hsl(${(batchIndex * BATCH_SIZE + i) * 6}, 70%, 50%)`;
      ctx.fillRect(0, 0, 1920, 1080);
      
      frames.push(canvas);
    }
    
    // Process batch
    const metadata: ImageBatchMetadata = {
      sourceTypes: new Uint8Array(BATCH_SIZE),
      loadStatus: new Uint8Array(BATCH_SIZE),
      errorCodes: new Uint16Array(BATCH_SIZE),
      timestamps: new Float64Array(BATCH_SIZE)
    };
    
    await loadImageBatch(frames, batch, metadata);
    
    // Apply filter in-place
    for (let i = 0; i < batch.count; i++) {
      const width = batch.widths[i];
      const height = batch.heights[i];
      const offset = batch.offsets[i];
      
      // Process directly in float array (simulated)
      for (let p = offset; p < offset + width * height * 4; p += 4) {
        const gray = 0.299 * batch.pixelData[p] + 
                    0.587 * batch.pixelData[p + 1] + 
                    0.114 * batch.pixelData[p + 2];
        batch.pixelData[p] = gray;
        batch.pixelData[p + 1] = gray;
        batch.pixelData[p + 2] = gray;
      }
    }
    
    const frameTime = performance.now() - frameStart;
    frameTimes.push(frameTime);
    
    // Simulate display
    process.stdout.write(`\rBatch ${batchIndex + 1}/${batches.length} processed in ${frameTime.toFixed(2)}ms`);
  }
  
  console.log('\n\nPerformance Summary:');
  const avgFrameTime = frameTimes.reduce((a, b) => a + b) / frameTimes.length;
  const maxFrameTime = Math.max(...frameTimes);
  const minFrameTime = Math.min(...frameTimes);
  
  console.log(`Average batch time: ${avgFrameTime.toFixed(2)}ms`);
  console.log(`Min batch time: ${minFrameTime.toFixed(2)}ms`);
  console.log(`Max batch time: ${maxFrameTime.toFixed(2)}ms`);
  console.log(`Effective FPS: ${(1000 / (avgFrameTime / BATCH_SIZE)).toFixed(1)}`);
  
  // Memory efficiency
  const totalMemory = batches.reduce((sum, batch) => {
    const pixels = batch.widths.slice(0, batch.count)
      .reduce((s, w, i) => s + w * batch.heights[i], 0);
    return sum + pixels * 4 * 4;
  }, 0);
  
  console.log(`\nTotal memory used: ${(totalMemory / 1024 / 1024).toFixed(2)}MB`);
  console.log(`Memory per frame: ${(totalMemory / FRAME_COUNT / 1024 / 1024).toFixed(2)}MB`);
}

// Run all examples
export async function runParallelExamples() {
  await compareLoadingPerformance();
  await batchProcessingPipeline();
  await realtimeProcessing();
}

// Execute if running directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runParallelExamples().catch(console.error);
}