import { describe, it, expect, beforeEach } from 'vitest';
import { 
  loadImageBatch,
  extractImageFromBatch,
  reserveBatchSpace,
  clearBatch,
  LoadStatus,
  ErrorCode,
  SourceType
} from './imageLoader.dod';
import { createImageBatch } from './types.dod';
import type { ImageBatch, ImageBatchMetadata } from './types.dod';

describe('DOD Image Loader', () => {
  let batch: ImageBatch;
  let metadata: ImageBatchMetadata;
  
  beforeEach(() => {
    batch = createImageBatch(10);
    metadata = {
      sourceTypes: new Uint8Array(10),
      loadStatus: new Uint8Array(10),
      errorCodes: new Uint16Array(10),
      timestamps: new Float64Array(10)
    };
  });
  
  describe('Batch Structure', () => {
    it('should create empty batch with correct capacity', () => {
      expect(batch.capacity).toBe(10);
      expect(batch.count).toBe(0);
      expect(batch.widths.length).toBe(10);
      expect(batch.heights.length).toBe(10);
      expect(batch.offsets.length).toBe(10);
      expect(batch.formats.length).toBe(10);
    });
    
    it('should reserve space for known dimensions', () => {
      const dimensions = [
        { width: 100, height: 100 },
        { width: 200, height: 150 },
        { width: 50, height: 50 }
      ];
      
      reserveBatchSpace(batch, dimensions);
      
      expect(batch.count).toBe(3);
      expect(batch.widths[0]).toBe(100);
      expect(batch.heights[0]).toBe(100);
      expect(batch.offsets[0]).toBe(0);
      
      expect(batch.widths[1]).toBe(200);
      expect(batch.heights[1]).toBe(150);
      expect(batch.offsets[1]).toBe(100 * 100 * 4); // Previous image size
      
      expect(batch.widths[2]).toBe(50);
      expect(batch.heights[2]).toBe(50);
      expect(batch.offsets[2]).toBe(100 * 100 * 4 + 200 * 150 * 4);
    });
    
    it('should clear batch for reuse', () => {
      batch.count = 5;
      clearBatch(batch);
      expect(batch.count).toBe(0);
    });
  });
  
  describe('Image Loading', () => {
    it('should load from data URL', async () => {
      // Create a small 2x2 red image data URL
      const canvas = document.createElement('canvas');
      canvas.width = 2;
      canvas.height = 2;
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = 'red';
      ctx.fillRect(0, 0, 2, 2);
      const dataUrl = canvas.toDataURL();
      
      await loadImageBatch([dataUrl], batch, metadata);
      
      expect(batch.count).toBe(1);
      expect(batch.widths[0]).toBe(2);
      expect(batch.heights[0]).toBe(2);
      expect(metadata.loadStatus[0]).toBe(LoadStatus.Loaded);
      expect(metadata.errorCodes[0]).toBe(ErrorCode.None);
      
      // Check pixel data (should be normalized to [0,1])
      const offset = batch.offsets[0];
      expect(batch.pixelData[offset]).toBeCloseTo(1.0); // Red channel
      expect(batch.pixelData[offset + 1]).toBe(0); // Green channel
      expect(batch.pixelData[offset + 2]).toBe(0); // Blue channel
      expect(batch.pixelData[offset + 3]).toBeCloseTo(1.0); // Alpha channel
    });
    
    it('should handle multiple images', async () => {
      // Create two small canvases
      const canvas1 = document.createElement('canvas');
      canvas1.width = 2;
      canvas1.height = 2;
      const ctx1 = canvas1.getContext('2d')!;
      ctx1.fillStyle = 'red';
      ctx1.fillRect(0, 0, 2, 2);
      
      const canvas2 = document.createElement('canvas');
      canvas2.width = 3;
      canvas2.height = 3;
      const ctx2 = canvas2.getContext('2d')!;
      ctx2.fillStyle = 'green';
      ctx2.fillRect(0, 0, 3, 3);
      
      await loadImageBatch([canvas1, canvas2], batch, metadata);
      
      expect(batch.count).toBe(2);
      expect(batch.widths[0]).toBe(2);
      expect(batch.heights[0]).toBe(2);
      expect(batch.widths[1]).toBe(3);
      expect(batch.heights[1]).toBe(3);
      
      expect(metadata.loadStatus[0]).toBe(LoadStatus.Loaded);
      expect(metadata.loadStatus[1]).toBe(LoadStatus.Loaded);
      
      // Check offsets
      expect(batch.offsets[0]).toBe(0);
      expect(batch.offsets[1]).toBe(2 * 2 * 4); // 16
    });
    
    it('should handle invalid sources', async () => {
      await loadImageBatch(['invalid-url', null as any], batch, metadata);
      
      expect(batch.count).toBe(2);
      expect(metadata.loadStatus[0]).toBe(LoadStatus.Error);
      expect(metadata.errorCodes[0]).toBe(ErrorCode.DecodeError);
    });
  });
  
  describe('Data Extraction', () => {
    it('should extract single image from batch', async () => {
      // Create a 2x2 red image
      const canvas = document.createElement('canvas');
      canvas.width = 2;
      canvas.height = 2;
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = 'rgb(255, 0, 0)';
      ctx.fillRect(0, 0, 2, 2);
      
      await loadImageBatch([canvas], batch, metadata);
      
      const extracted = extractImageFromBatch(batch, 0);
      
      expect(extracted.width).toBe(2);
      expect(extracted.height).toBe(2);
      expect(extracted.data[0]).toBe(255); // Red
      expect(extracted.data[1]).toBe(0);   // Green
      expect(extracted.data[2]).toBe(0);   // Blue
      expect(extracted.data[3]).toBe(255); // Alpha
    });
    
    it('should throw on invalid index', () => {
      batch.count = 1;
      expect(() => extractImageFromBatch(batch, 1)).toThrow('Index out of bounds');
    });
  });
  
  describe('Performance', () => {
    it('should load batch without allocations', async () => {
      const canvas = document.createElement('canvas');
      canvas.width = 100;
      canvas.height = 100;
      const ctx = canvas.getContext('2d')!;
      
      // Create gradient
      const gradient = ctx.createLinearGradient(0, 0, 100, 100);
      gradient.addColorStop(0, 'red');
      gradient.addColorStop(1, 'blue');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 100, 100);
      
      const sources = Array(5).fill(canvas);
      
      // Measure allocations (simplified - in real tests would use memory profiling)
      const startHeap = performance.memory?.usedJSHeapSize || 0;
      
      await loadImageBatch(sources, batch, metadata);
      
      const endHeap = performance.memory?.usedJSHeapSize || 0;
      
      expect(batch.count).toBe(5);
      
      // All images should be loaded
      for (let i = 0; i < 5; i++) {
        expect(metadata.loadStatus[i]).toBe(LoadStatus.Loaded);
      }
      
      // Note: This is a simplified check - proper memory testing would
      // require more sophisticated profiling tools
      console.log(`Memory delta: ${(endHeap - startHeap) / 1024}KB`);
    });
  });
  
  describe('Source Type Detection', () => {
    it('should detect various source types', async () => {
      const file = new File([''], 'test.png', { type: 'image/png' });
      const blob = new Blob([''], { type: 'image/png' });
      const canvas = document.createElement('canvas');
      const buffer = new ArrayBuffer(100);
      
      const sources = [
        'https://example.com/image.png',
        file,
        blob,
        canvas,
        buffer
      ];
      
      await loadImageBatch(sources, batch, metadata);
      
      expect(metadata.sourceTypes[0]).toBe(SourceType.URL);
      expect(metadata.sourceTypes[1]).toBe(SourceType.File);
      expect(metadata.sourceTypes[2]).toBe(SourceType.Blob);
      expect(metadata.sourceTypes[3]).toBe(SourceType.Canvas);
      expect(metadata.sourceTypes[4]).toBe(SourceType.ArrayBuffer);
    });
  });
  
  describe('Batch Operations', () => {
    it('should support incremental loading', async () => {
      const canvas1 = document.createElement('canvas');
      canvas1.width = 10;
      canvas1.height = 10;
      
      // First load
      await loadImageBatch([canvas1], batch, metadata);
      expect(batch.count).toBe(1);
      
      // Reserve space for next batch
      reserveBatchSpace(batch, [{ width: 20, height: 20 }], 1);
      expect(batch.count).toBe(2);
      
      // Verify offsets are correct
      expect(batch.offsets[0]).toBe(0);
      expect(batch.offsets[1]).toBe(10 * 10 * 4);
    });
  });
});