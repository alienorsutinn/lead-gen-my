import { ConnectionOptions } from 'bullmq';
import dotenv from 'dotenv';
dotenv.config();

export const connection: ConnectionOptions = {
    url: process.env.REDIS_URL || 'redis://localhost:6379'
};

export const QUEUE_NAME = 'lead-gen-queue';
