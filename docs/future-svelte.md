## Svelte 5 & SvelteKit Integration Ideas for WebGPU Image Processor

Here are potential future ideas for integrating the WebGPU Image Processing Library with Svelte 5 and SvelteKit, aiming to enhance developer experience by leveraging Svelte 5's Runes for fine-grained reactivity and SvelteKit's features.

**1. Svelte 5 Components for Image Processing:**

* **`<ImageProcessor />` Component:**
    * **Props (using `$props()`):**
        ```javascript
        let { src, filter, options = {} } = $props();
        // src: image URL, File object, or ImageData
        // filter: string or object defining the filter and its options
        // options: library initialization options like preferred backend
        ```
    * **State (using `$state()`):**
        ```javascript
        let processedImageData = $state(null);
        let processedUrl = $state(null);
        let isLoading = $state(false);
        let error = $state(null);
        let libraryInstance = $state(null); // To hold the initialized library
        ```
    * **Events:** Standard Svelte event dispatching for `processed`, `error`, `loadstart`, `loadend`.
    * **Effects (using `$effect()`):**
        * An `$effect` to initialize the library instance when the component mounts or options change.
        * An `$effect` that watches `src` and `filter`. When they change, it would:
            * Set `isLoading` to true.
            * Call the library's `loadImage` and `applyFilter` methods.
            * Update `processedImageData` / `processedUrl` or `error` state.
            * Set `isLoading` to false.
            * Dispatch relevant events.
    * **Slots:** For custom loading indicators or overlay content.
    * **Functionality:** Encapsulates the library's core logic. Automatically handles initialization, image loading, processing. The component could render an `<img>` tag with `processedUrl` or provide the `processedImageData` for custom rendering (e.g., to a canvas).
    * **Example Snippet (Conceptual):**
        ```html
        <script>
            // Props
            let { src, filter, options = {} } = $props();

            // State
            let processedUrl = $state(null);
            let isLoading = $state(false);
            let error = $state(null);
            let processor = $state(null); // Library instance

            // Effect for library initialization
            $effect(() => {
                // Assuming your library has an async init function
                YourImageLibrary.init(options).then(instance => {
                    processor = instance;
                }).catch(e => error = e);
            });

            // Effect for processing
            $effect(() => {
                if (!processor || !src || !filter) {
                    processedUrl = null; // Clear previous result if inputs are missing
                    return;
                }

                isLoading = true;
                error = null;
                processedUrl = null;

                const process = async () => {
                    try {
                        const imageData = await processor.loadImage(src);
                        const result = await processor.applyFilter(imageData, filter.name, filter.options);
                        // Assuming result needs conversion to a displayable URL
                        processedUrl = await processor.toDataURL(result); // Or similar utility
                        // dispatchEvent('processed', { url: processedUrl, data: result });
                    } catch (e) {
                        error = e;
                        // dispatchEvent('error', e);
                    } finally {
                        isLoading = false;
                    }
                };
                process();
            });
        </script>

        {#if isLoading}
            <p>Loading...</p>
        {:else if error}
            <p>Error: {error.message}</p>
        {:else if processedUrl}
            <img src={processedUrl} alt="Processed" />
        {:else}
            <p>Please provide an image and filter.</p>
        {/if}
        ```

* **`<WebGPUCanvas />` or `<ProcessedImage />` Component:**
    * Similar to above but might manage its own `<canvas>` element for rendering.
    * Would use `$props()` for inputs (src, filters) and `$effect()` to trigger re-renders on the canvas when these props change, leveraging the library.

**2. Svelte 5 State Management (Runes & Stores):**

* **Global Library Instance (using a simple module or a store):**
    * While components can manage their own instances, a shared instance might be useful.
    * A simple JavaScript module exporting a `$state`-backed instance or a classic Svelte store can manage this.
        ```javascript
        // lib/imageProcessorStore.js
        import { YourImageLibrary } from 'your-image-library';
        let instance = $state(null);
        let initialized = $state(false);
        let error = $state(null);

        export const imageProcessor = {
            get instance() { return instance; },
            get initialized() { return initialized; },
            get error() { return error; },
            async init(options) {
                if (initialized && !options) return instance; // Or re-init if options change
                try {
                    instance = await YourImageLibrary.init(options);
                    initialized = true;
                    error = null;
                    return instance;
                } catch (e) {
                    error = e;
                    initialized = false;
                    throw e;
                }
            }
        };
        ```
* **`$derived` for Capabilities:**
    * If the library instance is reactive, its capabilities (e.g., current backend, supported filters) could be exposed as `$derived` state.
        ```javascript
        // In a component or composable
        // import { imageProcessor } from './lib/imageProcessorStore.js';
        let currentBackend = $derived(imageProcessor.instance?.getCurrentBackend());
        ```
* **Configuration (using `$state` for local config or stores for global):**
    * Component-level configuration can use `$state`. Global preferences could still use Svelte stores or a module with reactive state.

**3. Svelte Actions (Still Relevant):**

* **`use:imageProcessorAction`:**
    * Actions remain a powerful tool. The internal implementation of the action could use `$effect` to react to parameter changes.
    * **Example (Conceptual Action Logic):**
        ```javascript
        // lib/actions.js
        export function imageProcessorAction(node, params) {
            let currentParams = $state(params); // Make params reactive within the action
            let libraryInstance = $state(null); // Manage instance per action use or use global

            // Effect to initialize and process
            $effect(() => {
                const { filter, options, srcOverride } = currentParams;
                const imgSrc = srcOverride || node.src; // If applied to <img>

                // Initialize library (simplified)
                YourImageLibrary.init(options).then(instance => {
                    libraryInstance = instance;
                    if (libraryInstance && imgSrc && filter) {
                        // ... perform loading and processing ...
                        // ... update node.src or draw to canvas (node) ...
                    }
                });
            });

            return {
                update(newParams) {
                    currentParams = newParams; // Triggers the $effect
                },
                destroy() {
                    // Cleanup library instance if managed locally
                }
            };
        }
        ```

**4. SvelteKit Specific Integrations (Largely Unchanged by Svelte 5 Core):**

* **Server-Side Pre-computation (with Node.js backend):**
    * SvelteKit `load` functions or server API routes remain the primary way to do this. The library's Node.js compatibility (Feature L-213) is key.
* **API Routes for On-Demand Processing:**
    * Still a valid and powerful pattern with SvelteKit.
* **Optimized Image Delivery (Build-time):**
    * Vite plugins for build-time processing are independent of Svelte 5's runtime but crucial for this.
* **SvelteKit Endpoints for Batch Processing:**
    * Unchanged in concept.

**5. Svelte 5 Composable Functions (Replaces Utility/Hook Pattern):**

* **`createImageProcessor()` Composable:**
    * This is where Svelte 5 shines. A composable function can encapsulate reactive logic related to the image processor.
    * **Example (Conceptual Composable):**
        ```javascript
        // lib/composables/useImageProcessor.js
        import { YourImageLibrary } from 'your-image-library'; // Your library

        export function useImageProcessor(initialSrc = null, initialFilter = null, initialOptions = {}) {
            let src = $state(initialSrc);
            let filter = $state(initialFilter);
            let options = $state(initialOptions); // Allow options to be reactive too

            let processor = $state(null);
            let processedUrl = $state(null);
            let processedData = $state(null);
            let isLoading = $state(false);
            let error = $state(null);

            $effect(() => { // Initialize processor when options change or on first run
                YourImageLibrary.init(options).then(instance => {
                    processor = instance;
                }).catch(e => error = e);
            });

            $effect(() => { // Process when src, filter, or processor instance changes
                if (!processor || !src || !filter) {
                    processedUrl = null;
                    processedData = null;
                    return;
                }

                isLoading = true;
                error = null;

                const runProcessing = async () => {
                    try {
                        const imageData = await processor.loadImage(src);
                        const result = await processor.applyFilter(imageData, filter.name, filter.options);
                        processedData = result;
                        // Assuming a utility to convert ImageData to URL if needed for display
                        processedUrl = await processor.toDataURL(result);
                    } catch (e) {
                        error = e;
                    } finally {
                        isLoading = false;
                    }
                };
                runProcessing();
            });

            return {
                // Reactive state for the component to use
                get src() { return src; },
                set src(newSrc) { src = newSrc; },
                get filter() { return filter; },
                set filter(newFilter) { filter = newFilter; },
                get options() { return options; },
                set options(newOptions) { options = newOptions; },

                get processedUrl() { return processedUrl; },
                get processedData() { return processedData; },
                get isLoading() { return isLoading; },
                get error() { return error; },
                // Potentially expose processor methods directly if safe
            };
        }
        ```
    * **Usage in a component:**
        ```html
        <script>
            import { useImageProcessor } from './lib/composables/useImageProcessor.js';

            let initialImageSrc = "path/to/default.jpg";
            let currentFilter = $state({ name: 'grayscale' });

            const image = useImageProcessor(initialImageSrc, currentFilter);

            function changeSource() {
                image.src = "path/to/another.jpg";
            }
            function applySepia() {
                image.filter = { name: 'sepia', intensity: 0.7 };
            }
        </script>

        <input type="text" bind:value={image.src} />
        <button onclick={applySepia}>Apply Sepia</button>

        {#if image.isLoading}
            <p>Processing...</p>
        {:else if image.error}
            <p>Error: {image.error.message}</p>
        {:else if image.processedUrl}
            <img src={image.processedUrl} alt="Processed by composable" />
        {/if}
        ```

**6. Build Tooling / Vite Plugins (Still Relevant):**

* Unchanged in concept but important for a smooth developer experience, especially with TypeGPU or WASM.

**Key Svelte 5 Considerations:**

* **Runes for Reactivity:** `$state` for mutable reactive state, `$derived` for computed values from other runes, and `$effect` for side effects that react to changes in runes. This makes reactive logic more explicit and often simpler.
* **Props with `$props()`:** The new way to declare and use component props.
* **No More `onMount` for many cases:** `$effect` often replaces `onMount` for setup logic that needs to re-run if dependencies change. For one-time setup, `onMount` is still fine, or an `$effect` with no dependencies.
* **Composables:** Functions that encapsulate reactive logic and state, making it reusable across components. This is a powerful pattern for library integrations.
* **Snippets:** For reusable UI fragments, though less directly related to the image processing logic itself, they can be useful for building UIs around your components (e.g., a standard loading/error display).

By embracing Svelte 5's runes and composable patterns, you can create highly reactive, efficient, and developer-friendly integrations for your WebGPU Image Processing Library.
