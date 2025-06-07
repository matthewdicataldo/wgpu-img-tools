/**
 * Web Worker for parallel image decoding
 * 
 * This worker handles image decoding in a separate thread,
 * allowing the main thread to remain responsive.
 */

// Message types
interface DecodeRequest {
  id: number;
  type: 'decode';
  source: ArrayBuffer | string;
  sourceType: 'buffer' | 'url' | 'dataurl';
}

interface DecodeResponse {
  id: number;
  type: 'result' | 'error';
  width?: number;
  height?: number;
  data?: ArrayBuffer;
  error?: string;
}

// Handle incoming messages
self.addEventListener('message', async (event: MessageEvent<DecodeRequest>) => {
  const { id, type, source, sourceType } = event.data;
  
  if (type !== 'decode') {
    self.postMessage({
      id,
      type: 'error',
      error: `Unknown message type: ${type}`
    } as DecodeResponse);
    return;
  }
  
  try {
    let imageData: ImageData;
    
    switch (sourceType) {
      case 'buffer':
        imageData = await decodeFromBuffer(source as ArrayBuffer);
        break;
        
      case 'url':
        imageData = await decodeFromURL(source as string);
        break;
        
      case 'dataurl':
        imageData = await decodeFromDataURL(source as string);
        break;
        
      default:
        throw new Error(`Unknown source type: ${sourceType}`);
    }
    
    // Transfer the data back to avoid copying
    const response: DecodeResponse = {
      id,
      type: 'result',
      width: imageData.width,
      height: imageData.height,
      data: imageData.data.buffer
    };
    
    // Transfer ownership of the ArrayBuffer
    self.postMessage(response, [imageData.data.buffer]);
    
  } catch (error) {
    self.postMessage({
      id,
      type: 'error',
      error: error instanceof Error ? error.message : String(error)
    } as DecodeResponse);
  }
});

// Decoding functions
async function decodeFromBuffer(buffer: ArrayBuffer): Promise<ImageData> {
  const blob = new Blob([buffer]);
  const bitmap = await createImageBitmap(blob);
  return extractImageData(bitmap);
}

async function decodeFromURL(url: string): Promise<ImageData> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch: ${response.statusText}`);
  }
  
  const blob = await response.blob();
  const bitmap = await createImageBitmap(blob);
  return extractImageData(bitmap);
}

async function decodeFromDataURL(dataURL: string): Promise<ImageData> {
  const response = await fetch(dataURL);
  const blob = await response.blob();
  const bitmap = await createImageBitmap(blob);
  return extractImageData(bitmap);
}

function extractImageData(bitmap: ImageBitmap): ImageData {
  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    throw new Error('Failed to get 2D context');
  }
  
  ctx.drawImage(bitmap, 0, 0);
  return ctx.getImageData(0, 0, bitmap.width, bitmap.height);
}

// Export types for use in main thread
export type { DecodeRequest, DecodeResponse };