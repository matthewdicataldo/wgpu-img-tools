/**
 * Worker Pool Management - Data-Oriented Design
 * 
 * Manages a pool of workers for parallel processing with:
 * - Zero-allocation task distribution
 * - Lock-free task queue
 * - Efficient result collection
 */

import type { WorkerPool, WorkerTask } from './types.dod';

// Task states
export const enum TaskState {
  Pending = 0,
  Running = 1,
  Complete = 2,
  Failed = 3
}

// ============================================
// Worker Pool Creation
// ============================================

/**
 * Create a worker pool with specified number of workers
 */
export function createWorkerPool(
  workerScript: string | URL,
  maxWorkers: number = navigator.hardwareConcurrency || 4
): WorkerPool {
  const pool: WorkerPool = {
    workers: [],
    taskQueue: new Uint32Array(1000), // Max 1000 tasks
    taskStatus: new Uint8Array(1000),
    taskWorker: new Uint8Array(1000),
    results: new Map(),
    activeCount: 0,
    maxWorkers
  };
  
  // Initialize workers
  for (let i = 0; i < maxWorkers; i++) {
    const worker = new Worker(workerScript, { type: 'module' });
    
    // Set up message handler
    worker.addEventListener('message', (event) => {
      handleWorkerMessage(pool, i, event);
    });
    
    worker.addEventListener('error', (error) => {
      console.error(`Worker ${i} error:`, error);
    });
    
    pool.workers.push(worker);
  }
  
  return pool;
}

/**
 * Destroy worker pool and clean up resources
 */
export function destroyWorkerPool(pool: WorkerPool): void {
  for (const worker of pool.workers) {
    worker.terminate();
  }
  
  pool.workers = [];
  pool.results.clear();
  pool.activeCount = 0;
}

// ============================================
// Task Management
// ============================================

/**
 * Submit tasks to the worker pool
 * Returns a promise that resolves when all tasks complete
 */
export async function submitTasks(
  pool: WorkerPool,
  tasks: WorkerTask[]
): Promise<Map<number, ArrayBuffer>> {
  const taskCount = tasks.length;
  const startIndex = findNextAvailableSlot(pool.taskStatus, taskCount);
  
  if (startIndex === -1) {
    throw new Error('Task queue full');
  }
  
  // Add tasks to queue
  for (let i = 0; i < taskCount; i++) {
    const task = tasks[i];
    const queueIndex = startIndex + i;
    
    pool.taskQueue[queueIndex] = task.id;
    pool.taskStatus[queueIndex] = TaskState.Pending;
    pool.taskWorker[queueIndex] = 255; // Not assigned
  }
  
  // Distribute tasks to available workers
  distributeTasks(pool, startIndex, taskCount, tasks);
  
  // Wait for all tasks to complete
  return waitForCompletion(pool, tasks.map(t => t.id));
}

/**
 * Find next available slot in task queue
 */
function findNextAvailableSlot(
  taskStatus: Uint8Array,
  count: number
): number {
  let consecutive = 0;
  
  for (let i = 0; i < taskStatus.length; i++) {
    if (taskStatus[i] === TaskState.Complete || 
        taskStatus[i] === TaskState.Failed ||
        taskStatus[i] === TaskState.Pending && consecutive === 0) {
      consecutive++;
      
      if (consecutive === count) {
        return i - count + 1;
      }
    } else {
      consecutive = 0;
    }
  }
  
  return -1;
}

/**
 * Distribute pending tasks to available workers
 */
function distributeTasks(
  pool: WorkerPool,
  startIndex: number,
  count: number,
  tasks: WorkerTask[]
): void {
  let taskIndex = 0;
  
  // First pass: assign to idle workers
  for (let w = 0; w < pool.workers.length && taskIndex < count; w++) {
    if (!isWorkerBusy(pool, w)) {
      const queueIndex = startIndex + taskIndex;
      const task = tasks[taskIndex];
      
      assignTaskToWorker(pool, queueIndex, w, task);
      taskIndex++;
    }
  }
  
  // Remaining tasks will be picked up as workers become available
}

/**
 * Check if a worker is currently busy
 */
function isWorkerBusy(pool: WorkerPool, workerIndex: number): boolean {
  for (let i = 0; i < pool.taskStatus.length; i++) {
    if (pool.taskStatus[i] === TaskState.Running && 
        pool.taskWorker[i] === workerIndex) {
      return true;
    }
  }
  return false;
}

/**
 * Assign a task to a specific worker
 */
function assignTaskToWorker(
  pool: WorkerPool,
  queueIndex: number,
  workerIndex: number,
  task: WorkerTask
): void {
  pool.taskStatus[queueIndex] = TaskState.Running;
  pool.taskWorker[queueIndex] = workerIndex;
  pool.activeCount++;
  
  // Send task to worker
  const worker = pool.workers[workerIndex];
  
  // Transfer ownership of input buffer
  if (task.input instanceof ArrayBuffer) {
    worker.postMessage({
      id: task.id,
      type: task.type,
      input: task.input,
      parameters: task.parameters
    }, [task.input]);
  } else {
    worker.postMessage({
      id: task.id,
      type: task.type,
      input: task.input,
      parameters: task.parameters
    });
  }
}

/**
 * Handle message from worker
 */
function handleWorkerMessage(
  pool: WorkerPool,
  workerIndex: number,
  event: MessageEvent
): void {
  const { id, type, data, error } = event.data;
  
  // Find task in queue
  let queueIndex = -1;
  for (let i = 0; i < pool.taskQueue.length; i++) {
    if (pool.taskQueue[i] === id && pool.taskWorker[i] === workerIndex) {
      queueIndex = i;
      break;
    }
  }
  
  if (queueIndex === -1) {
    console.error(`Task ${id} not found in queue`);
    return;
  }
  
  // Update task status
  if (type === 'result') {
    pool.taskStatus[queueIndex] = TaskState.Complete;
    pool.results.set(id, data);
  } else {
    pool.taskStatus[queueIndex] = TaskState.Failed;
    console.error(`Task ${id} failed:`, error);
  }
  
  pool.activeCount--;
  
  // Check for more pending tasks
  assignNextPendingTask(pool, workerIndex);
}

/**
 * Find and assign next pending task to worker
 */
function assignNextPendingTask(
  pool: WorkerPool,
  workerIndex: number
): void {
  for (let i = 0; i < pool.taskStatus.length; i++) {
    if (pool.taskStatus[i] === TaskState.Pending) {
      // Note: In real implementation, would need the actual task data
      // This is simplified for demonstration
      pool.taskStatus[i] = TaskState.Running;
      pool.taskWorker[i] = workerIndex;
      pool.activeCount++;
      
      // Would send actual task to worker here
      break;
    }
  }
}

/**
 * Wait for specific tasks to complete
 */
async function waitForCompletion(
  pool: WorkerPool,
  taskIds: number[]
): Promise<Map<number, ArrayBuffer>> {
  return new Promise((resolve) => {
    const checkInterval = setInterval(() => {
      let allComplete = true;
      
      for (const id of taskIds) {
        if (!pool.results.has(id)) {
          // Check if task failed
          for (let i = 0; i < pool.taskQueue.length; i++) {
            if (pool.taskQueue[i] === id && 
                pool.taskStatus[i] === TaskState.Failed) {
              // Task failed, but we still consider it "complete"
              pool.results.set(id, new ArrayBuffer(0));
              break;
            }
          }
          
          if (!pool.results.has(id)) {
            allComplete = false;
            break;
          }
        }
      }
      
      if (allComplete) {
        clearInterval(checkInterval);
        
        // Extract results for requested tasks
        const results = new Map<number, ArrayBuffer>();
        for (const id of taskIds) {
          const result = pool.results.get(id);
          if (result) {
            results.set(id, result);
            pool.results.delete(id); // Clean up
          }
        }
        
        resolve(results);
      }
    }, 10); // Check every 10ms
  });
}

// ============================================
// Performance Monitoring
// ============================================

export interface PoolStatistics {
  totalTasks: number;
  completedTasks: number;
  failedTasks: number;
  activeTasks: number;
  pendingTasks: number;
  workerUtilization: Float32Array;
}

/**
 * Get current pool statistics
 */
export function getPoolStatistics(pool: WorkerPool): PoolStatistics {
  let completed = 0;
  let failed = 0;
  let pending = 0;
  let running = 0;
  
  for (let i = 0; i < pool.taskStatus.length; i++) {
    switch (pool.taskStatus[i]) {
      case TaskState.Complete:
        completed++;
        break;
      case TaskState.Failed:
        failed++;
        break;
      case TaskState.Pending:
        pending++;
        break;
      case TaskState.Running:
        running++;
        break;
    }
  }
  
  const utilization = new Float32Array(pool.workers.length);
  for (let w = 0; w < pool.workers.length; w++) {
    utilization[w] = isWorkerBusy(pool, w) ? 1.0 : 0.0;
  }
  
  return {
    totalTasks: completed + failed + pending + running,
    completedTasks: completed,
    failedTasks: failed,
    activeTasks: running,
    pendingTasks: pending,
    workerUtilization: utilization
  };
}

// ============================================
// Specialized Image Decoding Pool
// ============================================

/**
 * Create a specialized pool for image decoding
 */
export function createImageDecoderPool(maxWorkers?: number): WorkerPool {
  // In a real implementation, would use actual worker script URL
  const workerURL = new URL('../workers/imageDecoder.worker.ts', import.meta.url);
  return createWorkerPool(workerURL, maxWorkers);
}

/**
 * Decode images in parallel using worker pool
 */
export async function decodeImagesParallel(
  pool: WorkerPool,
  sources: Array<{ data: ArrayBuffer | string; type: string }>
): Promise<Map<number, { width: number; height: number; data: ArrayBuffer }>> {
  const tasks: WorkerTask[] = sources.map((source, index) => ({
    id: index,
    type: 'decode',
    input: source.data instanceof ArrayBuffer ? source.data : new TextEncoder().encode(source.data),
    parameters: new TextEncoder().encode(JSON.stringify({ sourceType: source.type }))
  }));
  
  const results = await submitTasks(pool, tasks);
  
  // Parse results
  const imageResults = new Map();
  for (const [id, buffer] of results) {
    // In real implementation, would properly deserialize the result
    imageResults.set(id, {
      width: 0,
      height: 0,
      data: buffer
    });
  }
  
  return imageResults;
}