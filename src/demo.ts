import { initialize, createGrayscaleFilter, ImageProcessorInstance, ChainableImage } from './index';

// --- Global Library Variables ---
let processor: ImageProcessorInstance | null = null;
let chainableImage: ChainableImage | null = null;
let originalImageBitmap: ImageBitmap | null = null; // To store the originally loaded image bitmap

// --- UI Elements ---
const imageUpload = document.getElementById('imageUpload') as HTMLInputElement;
const processButton = document.getElementById('processButton') as HTMLButtonElement;
const originalImage = document.getElementById('originalImage') as HTMLImageElement;
const originalPlaceholder = document.getElementById('originalPlaceholder') as HTMLParagraphElement;
const webgpuCanvas = document.getElementById('webgpuCanvas') as HTMLCanvasElement;
const canvasPlaceholder = document.getElementById('canvasPlaceholder') as HTMLParagraphElement;
const webgpuStatus = document.getElementById('webgpu-status') as HTMLDivElement;

// --- Library Initialization ---
async function initLibrary(): Promise<boolean> {
    updateStatus("Initializing Library...", "info"); // Initial status
    try {
        processor = await initialize({ preferredBackend: 'webgpu' });
        updateStatus("Image Processing Library Initialized (WebGPU). Ready to load an image.", "success");
        canvasPlaceholder.textContent = "Output will appear here"; // Reset placeholder
        return true;
    } catch (error: any) {
        console.error("Library Initialization Error:", error);
        updateStatus(`Library Init Error: ${error.message}`, "error");
        processButton.disabled = true;
        return false;
    }
}

// --- Image Handling ---
imageUpload.addEventListener('change', async (event) => {
    const file = (event.target as HTMLInputElement)?.files?.[0];
    if (!file) {
        originalImage.classList.add('hidden');
        originalPlaceholder.classList.remove('hidden');
        originalPlaceholder.textContent = "No image loaded";
        webgpuCanvas.classList.add('hidden'); // Hide canvas
        canvasPlaceholder.classList.remove('hidden'); // Show placeholder
        canvasPlaceholder.textContent = "Output will appear here";
        processButton.disabled = true;
        chainableImage = null;
        originalImageBitmap = null;
        return;
    }

    if (!processor) {
        updateStatus("Library not initialized. Cannot load image.", "error");
        processButton.disabled = true;
        return;
    }

    try {
        updateStatus("Loading image...", "info");
        // Store the original ImageBitmap separately for display,
        // as ChainableImage will work with CoreImageData internally.
        originalImageBitmap = await createImageBitmap(file);

        // Display original image
        originalImage.src = URL.createObjectURL(file); // Or use originalImageBitmap if preferred for consistency
        originalImage.classList.remove('hidden');
        originalPlaceholder.classList.add('hidden');

        // Load image using the library
        chainableImage = await processor.load(file); // Use the file object directly

        // Prepare canvas for processed image display
        // The library's render() method will produce an ImageBitmap,
        // so we don't need to manage WebGPU textures directly here anymore.
        webgpuCanvas.width = originalImageBitmap.width;
        webgpuCanvas.height = originalImageBitmap.height;
        
        if (webgpuCanvas.width > 0 && webgpuCanvas.height > 0) {
            canvasPlaceholder.classList.add('hidden');
            webgpuCanvas.classList.remove('hidden'); // Show canvas if it has dimensions
        } else {
            canvasPlaceholder.classList.remove('hidden');
            webgpuCanvas.classList.add('hidden'); // Hide canvas if no dimensions
            canvasPlaceholder.textContent = "Output will appear here";
        }
        
        processButton.disabled = false;
        updateStatus("Image loaded. Ready to process.", "info");

    } catch (err: any) {
        console.error("Error loading image with library:", err);
        updateStatus(`Error loading image: ${err.message}`, "error");
        originalImage.classList.add('hidden');
        originalPlaceholder.classList.remove('hidden');
        originalPlaceholder.textContent = "Error loading image";
        webgpuCanvas.classList.add('hidden'); // Hide canvas on error
        canvasPlaceholder.classList.remove('hidden'); // Show placeholder
        processButton.disabled = true;
        chainableImage = null;
        originalImageBitmap = null;
    }
});

// --- Processing Logic ---
processButton.addEventListener('click', async () => {
    if (!chainableImage || !originalImageBitmap) {
        updateStatus("No image loaded or library not ready. Cannot process.", "warn");
        return;
    }

    try {
        updateStatus("Processing image with library...", "info");

        // Apply filter using the library
        const processedChain = chainableImage.filter(createGrayscaleFilter());
        const processedBitmap = await processedChain.render();

        // Display processed image on canvas
        // Set canvas internal resolution to the processed image's actual dimensions
        webgpuCanvas.width = processedBitmap.width;
        webgpuCanvas.height = processedBitmap.height;
        
        const ctx = webgpuCanvas.getContext('2d');
        if (ctx) {
            ctx.clearRect(0, 0, webgpuCanvas.width, webgpuCanvas.height); // Clear previous content
            // Draw the bitmap directly at its full size onto the canvas
            ctx.drawImage(processedBitmap, 0, 0);
            
            canvasPlaceholder.classList.add('hidden');
            webgpuCanvas.classList.remove('hidden');
            updateStatus("Grayscale filter applied successfully using library!", "success");
        } else {
            throw new Error("Failed to get 2D context from canvas for processed image.");
        }

    } catch (err: any) {
        console.error("Error processing image with library:", err);
        updateStatus(`Error during library processing: ${err.message}`, "error");
    }
});

// --- Utility Functions ---
function updateStatus(message: string, type: "info" | "error" | "success" | "warn" = "info") {
    webgpuStatus.textContent = message;
    // Clear previous styling
    webgpuStatus.classList.remove('bg-red-600', 'bg-green-600', 'bg-blue-600', 'bg-yellow-500', 'text-white', 'text-slate-800');
    
    switch (type) {
        case "error":
            webgpuStatus.classList.add('bg-red-600', 'text-white');
            break;
        case "success":
            webgpuStatus.classList.add('bg-green-600', 'text-white');
            break;
        case "warn":
            webgpuStatus.classList.add('bg-yellow-500', 'text-slate-800');
            break;
        case "info":
        default:
            webgpuStatus.classList.add('bg-blue-600', 'text-white');
            break;
    }
}

// --- Initialize Library on page load ---
document.addEventListener('DOMContentLoaded', async () => {
    // Initially hide canvas and show placeholder
    webgpuCanvas.width = 0; // Avoid tiny canvas render before image load
    webgpuCanvas.height = 0;
    webgpuCanvas.classList.add('hidden'); // Initially hide the canvas
    canvasPlaceholder.classList.remove('hidden');
    originalPlaceholder.classList.remove('hidden');

    if (await initLibrary()) {
        // Library initialized successfully. UI will guide user.
    } else {
        // Library initialization failed. Status message already updated.
        // Ensure process button remains disabled.
        processButton.disabled = true;
    }
});