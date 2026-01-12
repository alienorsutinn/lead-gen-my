
import { Queue } from 'bullmq';
import Redis from 'ioredis';

const connection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: null,
});

export const QUEUE_NAME = 'lead-gen-queue';

// Reuse connection? BullMQ creates its own mostly, but we can pass connection options.
// Actually, with serverless/Next.js, we should be careful about connections.
// But for this "local/VPS" setup, it's fine.

export const pipelineQueue = new Queue(QUEUE_NAME, {
    connection: connection as any // Casting because ioredis version mismatch sometimes 
});
