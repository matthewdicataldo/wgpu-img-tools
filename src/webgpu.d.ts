/// <reference types="@webgpu/types" />

// This file is intentionally left almost blank.
// Its purpose is to ensure that the WebGPU types are globally available
// by using the triple-slash directive above.

// You can also augment global interfaces here if needed, for example:
declare global {
  interface Navigator {
    readonly gpu: GPU;
  }
}
// The triple-slash directive should make other GPU types available.
// Augmenting Navigator explicitly helps with navigator.gpu.