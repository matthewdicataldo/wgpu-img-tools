export class WebGPUContextError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'WebGPUContextError';
        // Ensure the prototype chain is correctly set up
        Object.setPrototypeOf(this, WebGPUContextError.prototype);
    }
}

export class WebGPUInitializationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'WebGPUInitializationError';
        Object.setPrototypeOf(this, WebGPUInitializationError.prototype);
    }
}

export class WebGPUResourceError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'WebGPUResourceError';
        Object.setPrototypeOf(this, WebGPUResourceError.prototype);
    }
}

export class WebGPUShaderError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'WebGPUShaderError';
        Object.setPrototypeOf(this, WebGPUShaderError.prototype);
    }
}

export class UnsupportedFilterError extends Error {
    constructor(filterName: string) {
        super(`Unsupported filter: ${filterName}`);
        this.name = 'UnsupportedFilterError';
        Object.setPrototypeOf(this, UnsupportedFilterError.prototype);
    }
}