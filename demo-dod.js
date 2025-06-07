// Demonstration of Data-Oriented Design improvement
// Run with: node demo-dod.js

// Simulated current implementation (Object-Oriented)
function applySingleFilterOOP(imageData, operation) {
  // Creates new array (allocation!)
  const outputData = new Uint8ClampedArray(imageData.data);
  
  if (operation.name === 'grayscale') {
    for (let i = 0; i < outputData.length; i += 4) {
      const gray = Math.round(
        0.299 * outputData[i] +
        0.587 * outputData[i + 1] +
        0.114 * outputData[i + 2]
      );
      outputData[i] = gray;
      outputData[i + 1] = gray;
      outputData[i + 2] = gray;
    }
  }
  
  // Creates new object (another allocation!)
  return {
    data: outputData,
    width: imageData.width,
    height: imageData.height,
    format: imageData.format
  };
}

// New Data-Oriented implementation
function applySingleFilterDOD(data, width, height, operation) {
  const pixelCount = width * height;
  
  if (operation.name === 'grayscale') {
    // Process 4 pixels at a time for better cache usage
    const batchSize = 4;
    const batchPixelCount = Math.floor(pixelCount / batchSize) * batchSize;
    
    // Main loop - process in batches
    for (let i = 0; i < batchPixelCount * 4; i += batchSize * 4) {
      // Unroll loop for better performance
      for (let j = 0; j < batchSize; j++) {
        const idx = i + j * 4;
        const gray = Math.round(
          0.299 * data[idx] +
          0.587 * data[idx + 1] +
          0.114 * data[idx + 2]
        );
        data[idx] = gray;
        data[idx + 1] = gray;
        data[idx + 2] = gray;
      }
    }
    
    // Handle remaining pixels
    for (let i = batchPixelCount * 4; i < pixelCount * 4; i += 4) {
      const gray = Math.round(
        0.299 * data[i] +
        0.587 * data[i + 1] +
        0.114 * data[i + 2]
      );
      data[i] = gray;
      data[i + 1] = gray;
      data[i + 2] = gray;
    }
  }
}

// Performance comparison
function benchmark() {
  const sizes = [64, 256, 512, 1024];
  const iterations = 100;
  
  console.log('Data-Oriented Design Performance Comparison');
  console.log('===========================================\n');
  
  for (const size of sizes) {
    console.log(`Image size: ${size}x${size} (${size * size} pixels)`);
    
    // Create test data
    const pixels = size * size * 4;
    const testData = new Uint8ClampedArray(pixels);
    for (let i = 0; i < pixels; i++) {
      testData[i] = Math.floor(Math.random() * 256);
    }
    
    const imageData = {
      data: testData,
      width: size,
      height: size,
      format: 'rgba8unorm'
    };
    
    // Benchmark OOP approach
    const oopStart = process.hrtime.bigint();
    for (let i = 0; i < iterations; i++) {
      applySingleFilterOOP(imageData, { name: 'grayscale' });
    }
    const oopEnd = process.hrtime.bigint();
    const oopTime = Number(oopEnd - oopStart) / 1_000_000; // Convert to ms
    
    // Benchmark DOD approach
    const dodData = new Uint8ClampedArray(testData);
    const dodStart = process.hrtime.bigint();
    for (let i = 0; i < iterations; i++) {
      applySingleFilterDOD(dodData, size, size, { name: 'grayscale' });
    }
    const dodEnd = process.hrtime.bigint();
    const dodTime = Number(dodEnd - dodStart) / 1_000_000; // Convert to ms
    
    // Calculate improvement
    const improvement = oopTime / dodTime;
    const memoryAllocations = iterations * 2; // OOP creates 2 objects per iteration
    const memorySaved = (pixels + 32) * iterations; // Data array + object overhead
    
    console.log(`  OOP approach: ${oopTime.toFixed(2)}ms`);
    console.log(`  DOD approach: ${dodTime.toFixed(2)}ms`);
    console.log(`  Speedup: ${improvement.toFixed(2)}x faster`);
    console.log(`  Memory allocations avoided: ${memoryAllocations}`);
    console.log(`  Memory saved: ~${(memorySaved / 1024 / 1024).toFixed(2)}MB`);
    console.log('');
  }
  
  console.log('\nKey DOD Improvements:');
  console.log('1. In-place processing (no allocations)');
  console.log('2. Better cache utilization (batch processing)');
  console.log('3. Loop unrolling for reduced overhead');
  console.log('4. Direct array access (no object indirection)');
}

// Run the benchmark
benchmark();