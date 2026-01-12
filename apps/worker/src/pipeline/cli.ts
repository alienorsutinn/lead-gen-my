import { Queue } from 'bullmq';
import { JobType } from '@lead-gen-my/core';
import { connection, QUEUE_NAME } from '../queues'; // Fixing path relative to pipeline dir
import fs from 'fs/promises';
import path from 'path';

const pipelineQueue = new Queue(QUEUE_NAME, { connection });

async function main() {
    const args = process.argv.slice(2);
    const queriesFileIndex = args.indexOf('--queriesFile');
    if (queriesFileIndex === -1) {
        console.error("Usage: npm run worker:pipeline -- --queriesFile data/queries_my.json");
        process.exit(1);
    }
    const queriesFile = args[queriesFileIndex + 1];

    console.log(`Loading queries from ${queriesFile}...`);

    try {
        const content = await fs.readFile(path.resolve(process.cwd(), queriesFile), 'utf-8');
        const queries = JSON.parse(content) as { query: string }[];

        console.log(`Enqueuing ${queries.length} discovery jobs...`);

        for (const q of queries) {
            await pipelineQueue.add(JobType.DISCOVER, { query: q.query }, {
                jobId: `discover-${Buffer.from(q.query).toString('base64')}` // Dedupe by query
            });
        }

        console.log("Jobs enqueued. Worker will process them.");

    } catch (err) {
        console.error("Failed to start pipeline:", err);
        process.exit(1);
    } finally {
        await pipelineQueue.close();
    }
}

main().catch(console.error);
