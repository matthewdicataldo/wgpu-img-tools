import { describe, test, expect } from 'vitest';
import { createGrayscaleFilter, GRAYSCALE_FILTER_NAME } from './grayscale';
import type { GrayscaleFilter } from './grayscale'; // GrayscaleFilter is from here
import type { GrayscaleFilterOptions } from './common/types'; // GrayscaleFilterOptions is from common/types

describe('Grayscale Filter', () => {
    describe('createGrayscaleFilter', () => {
        test('should create a grayscale filter configuration with the correct name', () => {
            const filter = createGrayscaleFilter();
            expect(filter.name).toBe(GRAYSCALE_FILTER_NAME);
            expect(filter.name).toBe('grayscale');
        });

        test('should create a grayscale filter with undefined options if none are provided', () => {
            const filter = createGrayscaleFilter();
            expect(filter.options).toBeUndefined();
        });

        test('should pass through provided options to the filter configuration', () => {
            const mockOptions: GrayscaleFilterOptions = {
                // Add any mock options here if GrayscaleFilterOptions had properties
                // For now, it's an empty interface, so an empty object is fine.
            };
            const filter = createGrayscaleFilter(mockOptions);
            expect(filter.options).toBe(mockOptions);
        });

        test('should return an object conforming to GrayscaleFilter interface', () => {
            const options: GrayscaleFilterOptions = {};
            const filter: GrayscaleFilter = createGrayscaleFilter(options);
            
            expect(filter).toHaveProperty('name', GRAYSCALE_FILTER_NAME);
            expect(filter).toHaveProperty('options');
            if (options) {
                expect(filter.options).toEqual(options);
            } else {
                expect(filter.options).toBeUndefined();
            }
        });
    });
});