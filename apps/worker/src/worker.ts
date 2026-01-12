import { Worker } from 'bullmq';
import { connection, QUEUE_NAME } from './queues';
import { processJob } from './processor';

console.log('Starting worker process...');

const worker = new Worker(QUEUE_NAME, processJob, {
    connection,
    concurrency: 5
});

worker.on('completed', job => {
    console.log(`Job ${job.id} completed!`);
});

worker.on('failed', (job, err) => {
    console.error(`Job ${job?.id} failed with ${err.message}`);
});

console.log(`Worker listening on queue: ${QUEUE_NAME}`);
