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
    wasm: boolean;
    typescript: boolean;
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

        const webglSupported = this.isWebGLSupported();
        const wasmSupported = this.isWasmSupported();
        const typescriptBackendAvailable = this.isTypeScriptBackendAvailable();

        return {
            webgpu: webgpuSupported,
            webgl: webglSupported,
            wasm: wasmSupported,
            typescript: typescriptBackendAvailable,
        };
    }

    /**
     * Checks if a WebAssembly (WASM) backend is supported.
     *
     * @remarks
     * For the MVP, this method always returns `false` as the WASM backend is not yet implemented.
     * It serves as a placeholder for future WASM backend integration.
     *
     * @returns `false` in the current MVP implementation.
     */
    public isWasmSupported(): boolean {
        // MVP Stub: WASM backend not implemented
        return false;
    }

    /**
     * Checks if a pure TypeScript backend is available.
     *
     * @remarks
     * For the MVP, this method always returns `false`. While a TypeScript backend
     * is theoretically always possible, this stub indicates it's not actively implemented
     * or prioritized as a distinct selectable backend in the MVP.
     * The final fallback to pure TypeScript logic might occur implicitly if other
     * backends fail, rather than through explicit selection of a 'typescript' backend.
     *
     * @returns `false` in the current MVP implementation.
     */
    public isTypeScriptBackendAvailable(): boolean {
        // MVP Stub: TypeScript backend not actively implemented as a selectable option
        return false;
    }

    /**
     * Checks if WebGL is supported in the current environment.
     *
     * @returns `true` if WebGL (or experimental-webgl) context can be created, `false` otherwise.
     *
     * @remarks
     * This method attempts to create a WebGL rendering context on a temporary
     * canvas element to determine if WebGL is available.
     */
    public isWebGLSupported(): boolean {
        if (typeof document === 'undefined') {
            // document is not available (e.g., in a Node.js environment)
            return false;
        }
        try {
            const canvas = document.createElement('canvas');
            return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
        } catch (e) {
            return false;
        }
    }

    /**
     * Attempts to get a WebGPU device.
     *
     * @param options - Optional parameters for requesting the GPU adapter.
     * @returns A Promise that resolves to a GPUDevice if successful, or null otherwise.
     *
     * @remarks
     * This method encapsulates the logic for:
     * 1. Checking if `navigator.gpu` exists.
     * 2. Requesting a `GPUAdapter` using `navigator.gpu.requestAdapter(options)`.
     * 3. If an adapter is found, requesting a `GPUDevice` from the adapter.
     * It returns `null` if `navigator.gpu` is not present, if `requestAdapter` returns `null`,
     * or if `requestDevice` fails.
     */
    public async getWebGPUContext(options?: GPURequestAdapterOptions): Promise<GPUDevice | null> {
        if (typeof navigator === 'undefined' || !navigator.gpu) {
            console.warn('WebGPU not supported (navigator.gpu is unavailable).');
            return null;
        }

        try {
            const adapter = await navigator.gpu.requestAdapter(options);
            if (!adapter) {
                console.warn('Failed to get GPUAdapter.');
                return null;
            }

            const device = await adapter.requestDevice();
            return device;
        } catch (error) {
            console.error('Error requesting WebGPU device:', error);
            return null;
        }
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
            if (backend === 'wasm' && this.availableBackends.wasm) return 'wasm';
            if (backend === 'typescript' && this.availableBackends.typescript) return 'typescript';
        }
        // If no preferred and available backend is found, and 'typescript' was in the order but not available (e.g. stubbed to false)
        // or if the preferred list didn't include a viable option, we might return null.
        // However, a robust system might always ensure a final pure JS/TS fallback if all else fails,
        // potentially outside this explicit selection logic.
        // For MVP, if 'typescript' is preferred and availableBackends.typescript is true, it will be selected.
        // If it's false (as per current stubs), and no other backend is available, this will return null.
        return null;
    }
}