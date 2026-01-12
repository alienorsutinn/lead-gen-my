import { Job } from 'bullmq';
import { prisma } from '@lead-gen-my/db';
import { JobType, LeadStatus } from '@lead-gen-my/core';
import { createLLMClient } from '@lead-gen-my/llm';

const llm = createLLMClient(process.env.LLM_API_KEY || 'test-key');

export const processJob = async (job: Job) => {
    console.log(`Processing job ${job.id} of type ${job.name}`);

    try {
        if (job.name === JobType.SCAN_PLACE) {
            // Mock Place Scan
            const { placeId } = job.data;
            console.log(`Scanning place: ${placeId}`);
            await new Promise(r => setTimeout(r, 1000));
            // In real implementation: update DB with place details
            await prisma.lead.updateMany({
                where: { placeId },
                data: { status: LeadStatus.PROCESSED }
            });
        } else if (job.name === JobType.AUDIT_WEBSITE) {
            // Mock Audit
            const { leadId, url } = job.data;
            console.log(`Auditing website: ${url}`);
            // In real implementation: Playwright screenshot + LLM
            const analysis = await llm.analyzeWebsite("Mock HTML content");
            console.log('Analysis result:', analysis);

            await prisma.snapshot.create({
                data: {
                    leadId,
                    auditResult: JSON.parse(analysis)
                }
            });
        }
    } catch (err) {
        console.error(`Status failed for job ${job.id}`, err);
        throw err;
    }
};
