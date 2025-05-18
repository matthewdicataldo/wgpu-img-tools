import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import type { CoreImageData, FilterOperation } from '../../src/types'; // Adjust path as needed
// import { loadImageData } from '../../src/core/imageLoader'; // Adjust path - For future use if loading complex images
// import { applyFilters } from '../../src/core/filterProcessor'; // Adjust path - Will be called via page context

// Helper function to initialize WebGPU and get a GPUDevice handle (though handle not directly usable in page.evaluate)
async function getGPUDeviceHandle(page: Page): Promise<boolean> {
    return page.evaluate(async () => {
        if (!navigator.gpu) return false;
        try {
            const adapter = await navigator.gpu.requestAdapter();
            if (!adapter) return false;
            const device = await adapter.requestDevice();
            return !!device;
        } catch (e) {
            console.error('Error getting GPUDevice:', e);
            return false;
        }
    });
}

// Helper function to create simple CoreImageData (e.g., a 2x1 red image)
function createSampleCoreImageData(): CoreImageData {
    // Red pixel: R=255, G=0, B=0, A=255
    const data = new Uint8ClampedArray([
        255, 0, 0, 255,
        255, 0, 0, 255,
    ]);
    return { data, width: 2, height: 1, format: 'rgba8unorm' };
}

// Helper to compare two CoreImageData objects (pixel by pixel)
function compareCoreImageData(data1: CoreImageData, data2: CoreImageData, tolerance = 1): boolean {
    if (data1.width !== data2.width || data1.height !== data2.height || data1.format !== data2.format) {
        console.error('Dimension or format mismatch');
        return false;
    }
    if (data1.data.length !== data2.data.length) {
        console.error('Data length mismatch');
        return false;
    }

    for (let i = 0; i < data1.data.length; i++) {
        if (Math.abs((data1.data[i] as number) - (data2.data[i] as number)) > tolerance) {
            console.error(`Pixel data mismatch at index ${i}: Expected around ${data2.data[i]}, got ${data1.data[i]}`);
            return false;
        }
    }
    return true;
}

test.describe('FilterProcessor E2E GPU Path', () => {
    // test.beforeEach(async ({ page }) => {
    //     // Runs before each test; can be used to set up context if needed.
    //     // For example, loading the library or mocking navigator.gpu
    // });

    test('should load the test page successfully', async ({ page }) => {
        await page.goto('/tests/e2e/filter-test.html');
        await expect(page.locator('h1')).toHaveText('E2E Test Page for Image Processing');
    });

    test.only('applyFilters with grayscale (GPU) should process an image and render to canvas', async ({ page }) => {
        // Listen for all console events and log them to the test output
        page.on('console', msg => {
            const msgText = msg.text();
            console.log(`Browser Console [${msg.type()}]: ${msgText}`);
            // Attempt to extract URL from 404 error messages
            if (msg.type() === 'error' && msgText.includes('404')) {
                const match = msgText.match(/GET (http[^ ]+) /);
                if (match && match[1]) {
                    console.log(`Potential 404 URL from console: ${match[1]}`);
                }
            }
        });

        // Listen for failed requests and log their URLs
        page.on('requestfailed', request => {
            console.log(`Request Failed [${request.failure()?.errorText}]: ${request.url()}`);
        });

        // Diagnostic Step: Navigate to chrome://gpu
        await page.goto('chrome://gpu');
        // Wait for a known element/text on the chrome://gpu page to ensure it's loaded.
        // Let's look for "Graphics Feature Status" which is a prominent heading.
        await page.waitForSelector('text="Graphics Feature Status"', { timeout: 10000 }); // Wait up to 10 seconds
        await page.screenshot({ path: 'test-results/chrome-gpu-status.png' });
        console.log('chrome://gpu page screenshot captured as test-results/chrome-gpu-status.png');

        // Proceed to the actual test page
        await page.goto('/tests/e2e/filter-test.html');

        // 1. Prepare input CoreImageData (e.g., a simple red square)
        const width = 2;
        const height = 2;
        const inputPixelData = new Uint8ClampedArray([
            255, 0, 0, 255, 255, 0, 0, 255, // Row 1: Red, Red
            255, 0, 0, 255, 255, 0, 0, 255  // Row 2: Red, Red
        ]);
        const inputCoreImageData = {
            data: Array.from(inputPixelData), // Playwright evaluate might need plain array
            width: width,
            height: height,
            format: 'rgba8unorm' as const,
        };

        // 2. Define filter operations
        const filterOperations = [{ name: 'grayscale' }];

        // 3. Expose a function in the browser to run the test and get results
        // This would ideally call into our library's applyFilters function
        // For now, we'll assume `window.runApplyFiltersTest` exists in filter-test.html
        const result = await page.evaluate(async ({ imgData, ops }) => {
            // @ts-ignore - Assuming window.runApplyFiltersTest will be defined
            if (window.runApplyFiltersTest) {
                // @ts-ignore
                return window.runApplyFiltersTest(imgData, ops);
            }
            return { success: false, error: 'runApplyFiltersTest not found on window' }; // More specific error
        }, { imgData: inputCoreImageData, ops: filterOperations });

        // Add a more informative assertion message
        if (!result.success) {
            console.error('Browser-side error:', result.error); // Log the error from the browser
        }

        // 4. Assert the result
        expect(result.success, `Test failed with browser-side error: ${result.error || 'Unknown error'}`).toBe(true); // Custom message
        expect(result.width).toBe(width);
        expect(result.height).toBe(height);

        // 5. (Optional but recommended) Visually inspect the canvas or grab pixel data
        // This requires the canvas in filter-test.html to be updated by runApplyFiltersTest
        const canvas = page.locator('#outputCanvas');
        await expect(canvas).toHaveScreenshot('grayscale-gpu-output.png'); // Simple visual diff

        // More detailed pixel assertion (example):
        // const pixel = await canvas.evaluateHandle((canvasEl) => {
        //     const ctx = (canvasEl as HTMLCanvasElement).getContext('2d');
        //     if (!ctx) return null;
        //     const imageData = ctx.getImageData(0, 0, 1, 1).data;
        //     return { r: imageData[0], g: imageData[1], b: imageData[2], a: imageData[3] };
        // });
        // const expectedGrayValue = Math.round(0.299 * 255 + 0.587 * 0 + 0.114 * 0);
        // expect((await pixel.jsonValue())?.r).toBe(expectedGrayValue);
        // expect((await pixel.jsonValue())?.g).toBe(expectedGrayValue);
        // expect((await pixel.jsonValue())?.b).toBe(expectedGrayValue);
    });
}); 