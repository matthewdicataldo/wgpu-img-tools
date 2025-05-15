// src/utils/common.ts

/**
 * Example utility function.
 * Generates a simple unique ID (not cryptographically secure).
 * @param prefix - Optional prefix for the ID.
 * @returns A string representing a unique ID.
 */
export function simpleUID(prefix: string = 'id'): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Placeholder for a logging utility.
 * @param level - Log level (e.g., 'info', 'warn', 'error').
 * @param message - Message to log.
 * @param data - Optional additional data.
 */
export function log(level: 'info' | 'warn' | 'error', message: string, ...data: any[]): void {
    const timestamp = new Date().toISOString();
    switch (level) {
        case 'info':
            console.info(`[${timestamp}] INFO: ${message}`, ...data);
            break;
        case 'warn':
            console.warn(`[${timestamp}] WARN: ${message}`, ...data);
            break;
        case 'error':
            console.error(`[${timestamp}] ERROR: ${message}`, ...data);
            break;
        default:
            console.log(`[${timestamp}] ${level.toUpperCase()}: ${message}`, ...data);
    }
}

// Add other common utility functions here. 