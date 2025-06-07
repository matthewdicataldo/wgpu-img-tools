# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Commands

### Build and Development
```bash
# Install dependencies (use pnpm, not npm)
pnpm install

# Run development server for library
pnpm dev

# Run development server for demo application
pnpm dev:demo

# Build the library for distribution
pnpm build
```

### Testing
```bash
# Run unit tests
pnpm test

# Run unit tests with UI
pnpm test:ui

# Run tests in watch mode with coverage
pnpm test:watch

# Generate coverage report
pnpm coverage

# Run end-to-end tests (requires Chrome with WebGPU support)
pnpm test:e2e
```

### Code Quality
```bash
# Lint code
pnpm lint

# Lint and fix issues
pnpm lint:fix

# Check for unused dependencies
pnpm knip
```

## High-Level Architecture

### Project Overview
wgpu-img-tools is a WebGPU-accelerated image processing library with a graceful fallback strategy (WebGPU → WebGL → WASM → Pure TypeScript). The project follows data-oriented design principles for performance optimization.

### Core Architecture Components

1. **Core Module** (`src/core/`)
   - `imageProcessor.ts`: Main orchestration class that coordinates the entire image processing pipeline
   - `imageUtils.ts`: Data-oriented utilities for efficient image data manipulation and transformation
   - `fallbackController.ts`: Manages backend selection and automatic fallback when WebGPU is unavailable
   - `filterProcessor.ts`: Handles filter application logic across different backends
   - `imageLoader.ts`: Unified interface for loading images from various sources (files, URLs, canvas)

2. **Filters Module** (`src/filters/`)
   - Modular filter definitions that are backend-agnostic
   - Each filter exports its parameters and shader code
   - Example: `grayscale.ts` implements a perceptually-accurate grayscale conversion

3. **Renderers Module** (`src/renderers/`)
   - Backend-specific implementations for actual GPU/CPU processing
   - **WebGPU Renderer** (`src/renderers/webgpu/`):
     - Uses TypeGPU for type-safe WebGPU resource management
     - `webgpuRenderer.ts`: Main WebGPU backend implementation
     - `webgpuPipelineFactory.ts`: Creates compute/render pipelines with TypeGPU
     - `webgpuTextureUtils.ts`: Handles texture creation and data transfers
     - WGSL shaders in `shaders/` directory
   - Planned: WebGL, WASM, and Pure TypeScript renderers as fallbacks

### Key Design Decisions

1. **TypeGPU Integration**: The WebGPU backend uses TypeGPU for type-safe resource management, reducing runtime errors and improving developer experience.

2. **Data-Oriented Design**: 
   - Process images in batches when possible
   - Minimize object allocations and indirection
   - Optimize for cache-coherent memory access patterns
   - Precompute values for performance gains

3. **Asynchronous API**: All public APIs return Promises to handle the asynchronous nature of GPU operations and maintain non-blocking behavior.

4. **Modular Filter System**: Filters are defined independently of renderers, allowing the same filter to work across different backends.

### Testing Strategy

- **Unit Tests**: Test individual components in isolation using Vitest and happy-dom
- **Integration Tests**: Test component interactions and full processing pipelines
- **E2E Tests**: Use Playwright to test WebGPU functionality in real Chrome browser with `--enable-unsafe-webgpu` flag
- **Visual Regression**: E2E tests include screenshot comparisons for filter output validation

### Build Configuration

- **Library Build**: Outputs ES modules, UMD, and IIFE formats with TypeScript declarations
- **Demo Build**: Svelte 5 application with Tailwind CSS for showcasing library capabilities
- **Source Maps**: Generated for all builds to aid debugging

## Current Development State

The project is on the `feat/real-time-grayscale-preview` branch with many core files deleted, indicating active refactoring. The architecture is being rebuilt to support real-time preview capabilities.