export type PreferredBackend = 'webgpu' | 'webgl' | 'wasm' | 'typescript';
export type AvailableBackends = {
    webgpu: boolean;
    webgl: boolean;
    // wasm and typescript are assumed to always be available if needed as final fallbacks
};

export class FallbackController {
    private availableBackends: AvailableBackends;

    constructor() {
        this.availableBackends = this.detectAvailableBackends();
    }

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

    public getAvailableBackends(): AvailableBackends {
        return this.availableBackends;
    }

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