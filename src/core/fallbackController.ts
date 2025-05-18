/**
 * Represents the available rendering backend types in order of performance preference.
 * 
 * @remarks
 * - 'webgpu': Primary backend using WebGPU API for optimal GPU performance
 * - 'webgl': First fallback using WebGL when WebGPU is unavailable
 * - 'wasm': Second fallback using WebAssembly for CPU computation
 * - 'typescript': Final fallback using pure TypeScript for maximum compatibility
 */
export type PreferredBackend = 'webgpu' | 'webgl' | 'wasm' | 'typescript';

/**
 * Tracks which rendering backends are available in the current environment.
 * 
 * @remarks
 * WebAssembly and TypeScript backends are assumed to be always available
 * as they don't require special browser features, only the appropriate
 * code to be loaded.
 */
export type AvailableBackends = {
    webgpu: boolean;
    webgl: boolean;
    // wasm and typescript are assumed to always be available if needed as final fallbacks
};

/**
 * Controls the backend selection logic and fallback behavior.
 * 
 * @remarks
 * FallbackController is responsible for detecting which rendering backends
 * are available in the current environment and selecting the most appropriate
 * backend based on availability and preference.
 * 
 * The controller follows a fallback chain:
 * WebGPU → WebGL → WebAssembly → Pure TypeScript
 * 
 * @example
 * ```typescript
 * const fallbackController = new FallbackController();
 * const availableBackends = fallbackController.getAvailableBackends();
 * 
 * // Get the best available backend with default preference order
 * const bestBackend = fallbackController.getBestAvailableBackend();
 * 
 * // Get best backend with custom preference order
 * const customBackend = fallbackController.getBestAvailableBackend(['webgl', 'webgpu']);
 * ```
 */
export class FallbackController {
    private availableBackends: AvailableBackends;

    constructor() {
        this.availableBackends = this.detectAvailableBackends();
    }

    /**
     * Detects which rendering backends are available in the current environment.
     * 
     * @returns An object indicating which backends are available
     * 
     * @remarks
     * This method performs feature detection for WebGPU and WebGL.
     * WASM and TypeScript backends are assumed to be always available.
     */
    private detectAvailableBackends(): AvailableBackends {
        const webgpuSupported = typeof navigator !== 'undefined' && !!navigator.gpu;

        // Basic WebGL detection (can be more robust)
        let webglSupported = false;
        try {
            const canvas = typeof document !== 'undefined' ? document.createElement('canvas') : null;
            if (canvas) {
                webglSupported = !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
            }
        } catch (e) {
            webglSupported = false;
        }

        return {
            webgpu: webgpuSupported,
            webgl: webglSupported,
        };
    }

    /**
     * Returns information about which backends are available.
     * 
     * @returns An object with boolean flags for each possible backend
     */
    public getAvailableBackends(): AvailableBackends {
        return this.availableBackends;
    }

    /**
     * Determines the best available backend based on preference order.
     * 
     * @param preferred - Optional array specifying the preferred order of backends
     * @returns The most preferred available backend, or null if none are available
     * 
     * @remarks
     * If no preference order is specified, the default order is used:
     * ['webgpu', 'webgl', 'wasm', 'typescript']
     * 
     * The method will return the first backend in the preference list
     * that is available in the current environment.
     */
    public getBestAvailableBackend(preferred?: PreferredBackend[]): PreferredBackend | null {
        const order: PreferredBackend[] = preferred || ['webgpu', 'webgl', 'wasm', 'typescript'];

        for (const backend of order) {
            if (backend === 'webgpu' && this.availableBackends.webgpu) return 'webgpu';
            if (backend === 'webgl' && this.availableBackends.webgl) return 'webgl';
            if (backend === 'wasm') return 'wasm'; // Assume WASM can be loaded
            if (backend === 'typescript') return 'typescript'; // Pure TS always an option
        }
        return null; // Should not happen if 'typescript' is in order
    }
} 