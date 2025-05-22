<script lang="ts">
  import { onMount, $effect } from 'svelte'; // Added $effect
  import debounce from 'lodash.debounce'; // Added debounce
  import {
    initialize,
    createGrayscaleFilter,
    type ImageProcessorInstance,
    type ChainableImage,
  } from './index'; // Assuming this is the correct path to library exports

  let canvasOutput: HTMLCanvasElement;
  let originalImageDisplay: HTMLImageElement;
  let imageUploadInput: HTMLInputElement;
  let processButton: HTMLButtonElement;
  let statusMessageElement: HTMLParagraphElement;
  let originalImagePlaceholder: HTMLDivElement;
  let webgpuCanvasPlaceholder: HTMLDivElement;

  let processor = $state<ImageProcessorInstance | null>(null);
  let chainableImage = $state<ChainableImage | null>(null);
  let originalImageBitmap = $state<ImageBitmap | null>(null);
  let statusText = $state('');
  let statusType = $state<'success' | 'error' | 'info'>('info'); // 'success', 'error', 'info'
  let strength = $state(100); // For grayscale strength slider

  const updateStatus = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    statusText = message;
    statusType = type;
  };

  async function initLibrary() {
    updateStatus('Initializing WebGPU and ImageProcessor library...', 'info');
    try {
      processor = await initialize();
      if (processor) {
        updateStatus('ImageProcessor library initialized successfully.', 'success');
        processButton.disabled = false;
      } else {
        updateStatus('Failed to initialize ImageProcessor.', 'error');
      }
    } catch (error) {
      console.error('Initialization error:', error);
      updateStatus(`Error initializing library: ${(error as Error).message}`, 'error');
    }
  }

  onMount(async () => {
    // Initial UI setup
    canvasOutput.style.display = 'none';
    originalImageDisplay.style.display = 'none';
    webgpuCanvasPlaceholder.classList.remove('hidden');
    originalImagePlaceholder.classList.remove('hidden');
    processButton.disabled = true;

    await initLibrary();
  });

  async function handleImageUpload(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files[0]) {
      const file = target.files[0];
      updateStatus(`Image "${file.name}" selected.`, 'info');

      try {
        originalImageBitmap = await createImageBitmap(file);

        // Display the original image
        originalImageDisplay.src = URL.createObjectURL(file);
        originalImageDisplay.style.display = 'block';
        originalImagePlaceholder.classList.add('hidden');

        if (processor && originalImageBitmap) {
          updateStatus('Loading image into WebGPU...', 'info');
          chainableImage = await processor.load(originalImageBitmap);
          updateStatus('Image loaded into WebGPU. Ready to process.', 'success');
          canvasOutput.style.display = 'none'; // Hide previous output
          webgpuCanvasPlaceholder.classList.remove('hidden');
          processButton.disabled = false;
        } else {
          updateStatus('Processor not initialized or image not loaded.', 'error');
          processButton.disabled = true;
        }
      } catch (error) {
        console.error('Image loading error:', error);
        updateStatus(`Error loading image: ${(error as Error).message}`, 'error');
        originalImageDisplay.style.display = 'none';
        originalImagePlaceholder.classList.remove('hidden');
        processButton.disabled = true;
      }
    }
  }

  async function applyGrayscaleAndRender() {
    if (!chainableImage || !processor) {
      updateStatus('No image loaded or processor not initialized.', 'error');
      return;
    }

    updateStatus('Applying grayscale filter and rendering...', 'info');
    processButton.disabled = true;

    try {
      // Pass strength to the filter, normalized to 0.0 - 1.0
      const filter = createGrayscaleFilter({ strength: strength / 100 });
      const result = await chainableImage.apply(filter).render(canvasOutput);

      if (result) {
        canvasOutput.style.display = 'block';
        webgpuCanvasPlaceholder.classList.add('hidden');
        updateStatus('Grayscale filter applied and image rendered.', 'success');
      } else {
        updateStatus('Failed to render image.', 'error');
        canvasOutput.style.display = 'none';
        webgpuCanvasPlaceholder.classList.remove('hidden');
      }
    } catch (error) {
      console.error('Processing error:', error);
      updateStatus(`Error processing image: ${(error as Error).message}`, 'error');
      canvasOutput.style.display = 'none';
      webgpuCanvasPlaceholder.classList.remove('hidden');
    } finally {
      processButton.disabled = false;
    }
  }
</script>

<template>
  <div class="container mx-auto p-4 max-w-4xl">
    <header class="mb-8 text-center">
      <h1 class="text-4xl font-bold text-gray-800">Image Processing with WebGPU & Svelte</h1>
      <p class="text-lg text-gray-600">
        Experiment with client-side image manipulation using WebGPU.
      </p>
      <p
        bind:this={statusMessageElement}
        class="mt-4 text-sm font-medium p-3 rounded-md"
        class:text-green-700={statusType === 'success'}
        class:bg-green-100={statusType === 'success'}
        class:text-red-700={statusType === 'error'}
        class:bg-red-100={statusType === 'error'}
        class:text-blue-700={statusType === 'info'}
        class:bg-blue-100={statusType === 'info'}
        class:hidden={!statusText}
      >
        {statusText}
      </p>
    </header>

    <section class="mb-8 p-6 bg-white shadow-lg rounded-lg">
      <h2 class="text-2xl font-semibold text-gray-700 mb-4">1. Upload Image</h2>
      <div class="flex flex-col gap-4"> {/* Changed to flex-col for better layout with slider */}
        <input
          type="file"
          bind:this={imageUploadInput}
          on:change={handleImageUpload}
          accept="image/png, image/jpeg"
          class="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100
            sm:flex-grow"
        />
        
        <div class="my-2"> {/* Added margin for spacing, reduced from my-4 */}
          <label for="strengthSlider" class="block text-sm font-medium text-gray-600 mb-1">
            Grayscale Strength: {strength}%
          </label>
          <input
            type="range"
            id="strengthSlider"
            min="0"
            max="100"
            bind:value={strength}
            // Removed on:input={() => { if (chainableImage) applyGrayscaleAndRender(); }}
            class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500" 
            disabled={!chainableImage}
          />
        </div>

        <button
          bind:this={processButton}
          on:click={applyGrayscaleAndRender}
          class="w-full sm:w-auto bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-full shadow-md transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Process Image (Apply Filter)
        </button>
      </div>
    </section>

    <section class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div class="bg-white shadow-lg rounded-lg p-6">
        <h2 class="text-2xl font-semibold text-gray-700 mb-4">Original Image</h2>
        <div bind:this={originalImagePlaceholder} class="w-full h-64 bg-gray-100 rounded-md flex items-center justify-center text-gray-400">
          <span>Original image will appear here</span>
        </div>
        <img bind:this={originalImageDisplay} src="#" alt="Original Uploaded Image" class="w-full h-auto rounded-md shadow-sm" style="display: none;" />
      </div>

      <div class="bg-white shadow-lg rounded-lg p-6">
        <h2 class="text-2xl font-semibold text-gray-700 mb-4">WebGPU Output</h2>
        <div bind:this={webgpuCanvasPlaceholder} class="w-full h-64 bg-gray-100 rounded-md flex items-center justify-center text-gray-400">
          <span>Processed image will appear here</span>
        </div>
        <canvas bind:this={canvasOutput} class="w-full h-auto rounded-md shadow-sm" style="display: none;"></canvas>
      </div>
    </section>

    <footer class="mt-12 text-center text-sm text-gray-500">
      <p>WebGPU Image Processor Demo. Powered by Svelte 5.</p>
    </footer>
  </div>
</template>

<style>
  /* Scoped styles can go here if needed, or use global styles / Tailwind */
</style>
