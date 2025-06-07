import { describe, it, expect, beforeEach } from 'vitest';
import { applyFilters, applySingleFilterInPlace, applyFilterBatch } from './filterProcessor';
import { CoreImageData, FilterOperation } from '../types';

describe('filterProcessor - DOD Optimizations', () => {
  let testImage: CoreImageData;
  
  beforeEach(() => {
    // Create a test image (2x2 pixels, RGBA)
    testImage = {
      data: new Uint8ClampedArray([
        255, 0, 0, 255,    // Red pixel
        0, 255, 0, 255,    // Green pixel
        0, 0, 255, 255,    // Blue pixel
        128, 128, 128, 255 // Gray pixel
      ]),
      width: 2,
      height: 2,
      format: 'rgba8unorm'
    };
  });

  describe('applySingleFilterInPlace', () => {
    it('should apply grayscale filter in-place without allocations', () => {
      const data = new Uint8ClampedArray(testImage.data);
      const originalBuffer = data.buffer;
      
      applySingleFilterInPlace(data, testImage.width, testImage.height, { name: 'grayscale' });
      
      // Verify the buffer is the same (no allocation)
      expect(data.buffer).toBe(originalBuffer);
      
      // Verify grayscale conversion
      // Red (255,0,0) -> ~76 gray
      expect(data[0]).toBe(76);
      expect(data[1]).toBe(76);
      expect(data[2]).toBe(76);
      expect(data[3]).toBe(255); // Alpha unchanged
      
      // Green (0,255,0) -> ~150 gray
      expect(data[4]).toBe(150);
      expect(data[5]).toBe(150);
      expect(data[6]).toBe(150);
      expect(data[7]).toBe(255);
    });

    it('should handle large images efficiently', () => {
      // Create a larger test image (100x100 pixels)
      const size = 100;
      const largeData = new Uint8ClampedArray(size * size * 4);
      
      // Fill with random colors
      for (let i = 0; i < largeData.length; i += 4) {
        largeData[i] = Math.floor(Math.random() * 256);     // R
        largeData[i + 1] = Math.floor(Math.random() * 256); // G
        largeData[i + 2] = Math.floor(Math.random() * 256); // B
        largeData[i + 3] = 255;                             // A
      }
      
      const startTime = performance.now();
      applySingleFilterInPlace(largeData, size, size, { name: 'grayscale' });
      const endTime = performance.now();
      
      // Should be very fast (typically < 1ms for 100x100)
      expect(endTime - startTime).toBeLessThan(5);
      
      // Verify all pixels are grayscale (R=G=B)
      for (let i = 0; i < largeData.length; i += 4) {
        expect(largeData[i]).toBe(largeData[i + 1]);
        expect(largeData[i + 1]).toBe(largeData[i + 2]);
      }
    });
  });

  describe('applyFilters with in-place option', () => {
    it('should support in-place processing when requested', async () => {
      const originalBuffer = (testImage.data as Uint8ClampedArray).buffer;
      
      const result = await applyFilters(
        testImage,
        { name: 'grayscale' },
        undefined,
        { inPlace: true }
      );
      
      // Should reuse the same buffer
      expect((result.data as Uint8ClampedArray).buffer).toBe(originalBuffer);
    });

    it('should create new buffer when in-place is false', async () => {
      const originalBuffer = (testImage.data as Uint8ClampedArray).buffer;
      
      const result = await applyFilters(
        testImage,
        { name: 'grayscale' },
        undefined,
        { inPlace: false }
      );
      
      // Should have different buffer
      expect((result.data as Uint8ClampedArray).buffer).not.toBe(originalBuffer);
    });
  });

  describe('applyFilterBatch', () => {
    it('should process multiple images efficiently', () => {
      const images: CoreImageData[] = Array(10).fill(null).map(() => ({
        data: new Uint8ClampedArray(testImage.data),
        width: testImage.width,
        height: testImage.height,
        format: testImage.format
      }));
      
      const startTime = performance.now();
      const results = applyFilterBatch(images, { name: 'grayscale' });
      const endTime = performance.now();
      
      // Should process all images
      expect(results).toHaveLength(10);
      
      // Each should be grayscale
      results.forEach(result => {
        const data = result.data as Uint8ClampedArray;
        expect(data[0]).toBe(76);  // Red -> gray
        expect(data[4]).toBe(150); // Green -> gray
      });
      
      // Should be fast
      expect(endTime - startTime).toBeLessThan(10);
    });
  });

  describe('Performance comparison', () => {
    it('should demonstrate allocation overhead', async () => {
      const size = 256; // 256x256 image
      const iterations = 100;
      const largeImage: CoreImageData = {
        data: new Uint8ClampedArray(size * size * 4),
        width: size,
        height: size,
        format: 'rgba8unorm'
      };
      
      // Fill with random data
      const data = largeImage.data as Uint8ClampedArray;
      for (let i = 0; i < data.length; i++) {
        data[i] = Math.floor(Math.random() * 256);
      }
      
      // Measure in-place processing
      const inPlaceStart = performance.now();
      for (let i = 0; i < iterations; i++) {
        applySingleFilterInPlace(
          data,
          largeImage.width,
          largeImage.height,
          { name: 'grayscale' }
        );
      }
      const inPlaceTime = performance.now() - inPlaceStart;
      
      // Measure with allocations
      const allocStart = performance.now();
      for (let i = 0; i < iterations; i++) {
        await applyFilters(largeImage, { name: 'grayscale' }, undefined, { inPlace: false });
      }
      const allocTime = performance.now() - allocStart;
      
      console.log(`In-place: ${inPlaceTime.toFixed(2)}ms, With allocations: ${allocTime.toFixed(2)}ms`);
      console.log(`Speedup: ${(allocTime / inPlaceTime).toFixed(2)}x`);
      
      // In-place should be significantly faster
      expect(inPlaceTime).toBeLessThan(allocTime);
    });
  });
});