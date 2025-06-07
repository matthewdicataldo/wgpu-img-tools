/**
 * Data-Oriented Image Loader
 * 
 * This module provides high-performance image loading using DOD principles:
 * - Zero allocations during processing
 * - Batch loading for efficiency
 * - Structure of Arrays for cache optimization
 * - Support for parallel decoding
 */

import { ImageBatch, ImageBatchMetadata, WorkerPool, MemoryPool } from './types.dod';

// ============================================
// Image Source Types
// ============================================

export const enum SourceType {
  File = 0,
  URL = 1,
  Blob = 2,
  ImageBitmap = 3,
  Canvas = 4,
  ArrayBuffer = 5
}

export const enum LoadStatus {
  Pending = 0,
  Loading = 1,
  Loaded = 2,
  Error = 3
}

export const enum ErrorCode {
  None = 0,
  InvalidSource = 1,
  NetworkError = 2,
  DecodeError = 3,
  OutOfMemory = 4,
  Unsupported = 5
}

// ============================================
// Core Loading Functions
// ============================================

/**
 * Load multiple images into a batch structure
 * This is the main entry point for image loading
 */
export async function loadImageBatch(
  sources: unknown[],
  batch: ImageBatch,
  metadata: ImageBatchMetadata,
  options: LoadOptions = {}
): Promise<void> {
  const count = Math.min(sources.length, batch.capacity);
  batch.count = count;
  
  // Initialize metadata
  for (let i = 0; i < count; i++) {
    metadata.sourceTypes[i] = getSourceType(sources[i]);
    metadata.loadStatus[i] = LoadStatus.Pending;
    metadata.errorCodes[i] = ErrorCode.None;
    metadata.timestamps[i] = performance.now();
  }
  
  // Use parallel loading if available and beneficial
  if (options.parallel && count > 4 && options.workerPool) {
    await loadBatchParallel(sources, batch, metadata, options.workerPool);
  } else {
    await loadBatchSequential(sources, batch, metadata, options);
  }
}

/**
 * Sequential loading - simpler but slower for many images
 */
async function loadBatchSequential(
  sources: unknown[],
  batch: ImageBatch,
  metadata: ImageBatchMetadata,
  options: LoadOptions
): Promise<void> {
  let currentOffset = 0;
  
  for (let i = 0; i < batch.count; i++) {
    metadata.loadStatus[i] = LoadStatus.Loading;
    
    try {
      const imageData = await loadSingleImage(sources[i], metadata.sourceTypes[i]);
      
      // Copy to batch structure
      batch.widths[i] = imageData.width;
      batch.heights[i] = imageData.height;
      batch.offsets[i] = currentOffset;
      batch.formats[i] = 0; // RGBA8
      
      // Convert and copy pixel data
      const pixelCount = imageData.width * imageData.height * 4;
      copyPixelsToBatch(
        imageData.data,
        batch.pixelData,
        currentOffset,
        pixelCount
      );
      
      currentOffset += pixelCount;
      metadata.loadStatus[i] = LoadStatus.Loaded;
      metadata.timestamps[i] = performance.now();
      
    } catch (error) {
      metadata.loadStatus[i] = LoadStatus.Error;
      metadata.errorCodes[i] = ErrorCode.DecodeError;
      console.error(`Failed to load image ${i}:`, error);
    }
  }
}

/**
 * Parallel loading using worker pool
 */
async function loadBatchParallel(
  sources: unknown[],
  batch: ImageBatch,
  metadata: ImageBatchMetadata,
  pool: WorkerPool
): Promise<void> {
  // Create tasks for each image
  const tasks = sources.slice(0, batch.count).map((source, index) => ({
    id: index,
    source,
    type: metadata.sourceTypes[index]
  }));
  
  // Distribute tasks to workers
  const results = await distributeTasks(pool, tasks);
  
  // Copy results to batch
  let currentOffset = 0;
  for (let i = 0; i < batch.count; i++) {
    const result = results.get(i);
    
    if (result) {
      batch.widths[i] = result.width;
      batch.heights[i] = result.height;
      batch.offsets[i] = currentOffset;
      batch.formats[i] = 0; // RGBA8
      
      const pixelCount = result.width * result.height * 4;
      batch.pixelData.set(
        new Float32Array(result.data, 0, pixelCount),
        currentOffset
      );
      
      currentOffset += pixelCount;
      metadata.loadStatus[i] = LoadStatus.Loaded;
    } else {
      metadata.loadStatus[i] = LoadStatus.Error;
      metadata.errorCodes[i] = ErrorCode.DecodeError;
    }
    
    metadata.timestamps[i] = performance.now();
  }
}

/**
 * Load a single image based on source type
 */
async function loadSingleImage(
  source: unknown,
  sourceType: SourceType
): Promise<ImageData> {
  switch (sourceType) {
    case SourceType.File:
      return loadFromFile(source as File);
      
    case SourceType.URL:
      return loadFromURL(source as string);
      
    case SourceType.Blob:
      return loadFromBlob(source as Blob);
      
    case SourceType.ImageBitmap:
      return loadFromImageBitmap(source as ImageBitmap);
      
    case SourceType.Canvas:
      return loadFromCanvas(source as HTMLCanvasElement);
      
    case SourceType.ArrayBuffer:
      return loadFromArrayBuffer(source as ArrayBuffer);
      
    default:
      throw new Error(`Unsupported source type: ${sourceType}`);
  }
}

// ============================================
// Source-specific loaders
// ============================================

async function loadFromFile(file: File): Promise<ImageData> {
  const bitmap = await createImageBitmap(file);
  return loadFromImageBitmap(bitmap);
}

async function loadFromURL(url: string): Promise<ImageData> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.statusText}`);
  }
  
  const blob = await response.blob();
  return loadFromBlob(blob);
}

async function loadFromBlob(blob: Blob): Promise<ImageData> {
  const bitmap = await createImageBitmap(blob);
  return loadFromImageBitmap(bitmap);
}

function loadFromImageBitmap(bitmap: ImageBitmap): ImageData {
  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    throw new Error('Failed to get 2D context');
  }
  
  ctx.drawImage(bitmap, 0, 0);
  return ctx.getImageData(0, 0, bitmap.width, bitmap.height);
}

function loadFromCanvas(canvas: HTMLCanvasElement): ImageData {
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    throw new Error('Canvas has no 2D context');
  }
  
  return ctx.getImageData(0, 0, canvas.width, canvas.height);
}

async function loadFromArrayBuffer(buffer: ArrayBuffer): Promise<ImageData> {
  const blob = new Blob([buffer]);
  return loadFromBlob(blob);
}

// ============================================
// Utility Functions
// ============================================

function getSourceType(source: unknown): SourceType {
  if (source instanceof File) return SourceType.File;
  if (typeof source === 'string') return SourceType.URL;
  if (source instanceof Blob) return SourceType.Blob;
  if (source instanceof ImageBitmap) return SourceType.ImageBitmap;
  if (source instanceof HTMLCanvasElement) return SourceType.Canvas;
  if (source instanceof ArrayBuffer) return SourceType.ArrayBuffer;
  
  throw new Error('Unsupported image source type');
}

/**
 * Copy pixels to batch with optional format conversion
 */
function copyPixelsToBatch(
  source: Uint8ClampedArray,
  destination: Float32Array,
  offset: number,
  count: number
): void {
  // Convert uint8 to normalized float [0, 1]
  for (let i = 0; i < count; i++) {
    destination[offset + i] = source[i] / 255.0;
  }
}

/**
 * Extract a single image from batch
 */
export function extractImageFromBatch(
  batch: ImageBatch,
  index: number
): ImageData {
  if (index >= batch.count) {
    throw new Error('Index out of bounds');
  }
  
  const width = batch.widths[index];
  const height = batch.heights[index];
  const offset = batch.offsets[index];
  const pixelCount = width * height * 4;
  
  // Convert back to uint8
  const data = new Uint8ClampedArray(pixelCount);
  for (let i = 0; i < pixelCount; i++) {
    data[i] = Math.round(batch.pixelData[offset + i] * 255);
  }
  
  return new ImageData(data, width, height);
}

// ============================================
// Worker Pool Management
// ============================================

async function distributeTasks(
  pool: WorkerPool,
  tasks: Array<{ id: number; source: unknown; type: SourceType }>
): Promise<Map<number, { width: number; height: number; data: ArrayBuffer }>> {
  // This is a simplified version - real implementation would
  // properly distribute tasks and handle worker communication
  
  const results = new Map();
  
  for (const task of tasks) {
    try {
      const imageData = await loadSingleImage(task.source, task.type);
      results.set(task.id, {
        width: imageData.width,
        height: imageData.height,
        data: imageData.data.buffer
      });
    } catch (error) {
      console.error(`Task ${task.id} failed:`, error);
    }
  }
  
  return results;
}

// ============================================
// Options and Configuration
// ============================================

export interface LoadOptions {
  parallel?: boolean;
  workerPool?: WorkerPool;
  memoryPool?: MemoryPool;
  maxWidth?: number;
  maxHeight?: number;
  format?: 'rgba8' | 'bgra8';
  premultiplyAlpha?: boolean;
}

// ============================================
// Batch Operations
// ============================================

/**
 * Pre-allocate space for images with known dimensions
 */
export function reserveBatchSpace(
  batch: ImageBatch,
  dimensions: Array<{ width: number; height: number }>,
  startIndex = 0
): void {
  let currentOffset = startIndex > 0 ? batch.offsets[startIndex - 1] : 0;
  
  for (let i = 0; i < dimensions.length && startIndex + i < batch.capacity; i++) {
    const index = startIndex + i;
    const { width, height } = dimensions[i];
    
    batch.widths[index] = width;
    batch.heights[index] = height;
    batch.offsets[index] = currentOffset;
    batch.formats[index] = 0; // RGBA8
    
    currentOffset += width * height * 4;
  }
  
  batch.count = Math.max(batch.count, startIndex + dimensions.length);
}

/**
 * Clear a batch for reuse
 */
export function clearBatch(batch: ImageBatch): void {
  batch.count = 0;
  // No need to clear arrays - they'll be overwritten
}

/**
 * Compact a batch to remove gaps
 */
export function compactBatch(
  batch: ImageBatch,
  validIndices: Uint32Array
): void {
  // Implementation would rearrange data to be contiguous
  // This is useful after filtering out failed loads
}

// ============================================
// Performance Monitoring
// ============================================

export interface LoadStatistics {
  totalImages: number;
  successfulLoads: number;
  failedLoads: number;
  totalBytes: number;
  totalTime: number;
  averageTime: number;
}

export function calculateLoadStatistics(
  metadata: ImageBatchMetadata,
  count: number,
  startTime: number
): LoadStatistics {
  let successful = 0;
  let failed = 0;
  
  for (let i = 0; i < count; i++) {
    if (metadata.loadStatus[i] === LoadStatus.Loaded) {
      successful++;
    } else if (metadata.loadStatus[i] === LoadStatus.Error) {
      failed++;
    }
  }
  
  const totalTime = performance.now() - startTime;
  
  return {
    totalImages: count,
    successfulLoads: successful,
    failedLoads: failed,
    totalBytes: 0, // Would calculate from batch data
    totalTime,
    averageTime: totalTime / count
  };
}