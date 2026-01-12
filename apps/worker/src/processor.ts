import { Job, Queue } from 'bullmq';
import { JobType } from '@lead-gen-my/core';
import { connection, QUEUE_NAME } from './queues';
import { logger } from './lib/logger';
import { usageTracker, METRICS } from './lib/usage';
import { DiscoveryService } from './discovery/service';
import { WebsiteChecker } from './websites/websiteChecker';
import { PsiService } from './psi/psiApi';
import { ScreenshotService } from './screenshots/service';
import { LlmVerdictService } from './llm/service';
import { LeadScoringService } from './scoring/service';

// Services
const discoveryService = new DiscoveryService();
const websiteChecker = new WebsiteChecker();
const psiService = new PsiService();
const screenshotService = new ScreenshotService();
const llmService = new LlmVerdictService();
const scoringService = new LeadScoringService();

// Queue for chaining
const pipelineQueue = new Queue(QUEUE_NAME, { connection });

export const processJob = async (job: Job) => {
    logger.info({ jobId: job.id, type: job.name }, "Processing Job");

    try {
        switch (job.name) {
            case JobType.DISCOVER: {
                // Check usage before calling
                // Note: DiscoveryService finds multiple places. We might want to cap *attempts* or *results*.
                // Here we cap the "action" of running a query, or we pass logic inside?
                // Plan said: "Check usage... if limit hit -> log and skip"
                // Let's increment by a batch size estimate, or just 1 per query?
                // User requirement: MAX_PLACES_DISCOVERED. So we should probably count results inside service.
                // But for simplicity/safety, let's wrap the *job*.
                // Actually, 'checkAndIncrement' is atomic. 
                // Let's allow the job to run, but inside service we check?
                // The processor is the gatekeeper.
                // Let's modify the processor to check limits.

                // For Discovery, we increment by X places found? 
                // Hard to know before running. 
                // Let's pass the tracker to service?
                // For now, let's just use a placeholder limit "DISCOVER_PLACES" as "queries run" or update tracker to handle Places Discovered count.
                // The requirements say "MAX_PLACES_DISCOVERED_PER_DAY".
                // So we must count places.
                // We'll let the service handle the increment logic or do it after?
                // Better: Check if we have budget *before* searching.

                const { query } = job.data;
                // We don't increment here, we just check if we are already over limit?
                // usageTracker.checkAndIncrement increments. We want `check`.
                // For discovery, let's assume we consume 20 places per query?

                // Refined Approach: Pass usage control to services or handle basic counts here.
                // PSI, LLM, Screenshot are 1-to-1 with jobs. Easy.
                // Discover: Let's defer to service or use a specific metric.

                const hasBudget = await usageTracker.checkAndIncrement(METRICS.DISCOVER_PLACES, 0); // Check only
                if (!hasBudget) {
                    logger.warn({ jobId: job.id, type: job.name }, "Skipping Discovery: Daily Place Limit Reached. (Set MAX_PLACES_DISCOVERED_PER_DAY env var to increase)");
                    return;
                }

                // We need to count actuals.
                // Let's invoke service, then increment usage by actual count?
                // OR service increments. 
                // Let's make service return count and we increment here.

                const placeIds = await discoveryService.discoverAndSave(query);

                // Now increment usage
                await usageTracker.checkAndIncrement(METRICS.DISCOVER_PLACES, placeIds.length);

                // Chain...

                for (const placeId of placeIds) {
                    await pipelineQueue.add(JobType.WEBSITE_CHECK, { placeId }, {
                        jobId: `website - check - ${placeId} ` // Dedupe?
                    });
                }
                break;
            }

            case JobType.WEBSITE_CHECK: {
                const { placeId } = job.data;
                // Fetch URL from DB since job only has placeId? Or pass in job?
                // Ideally service handles it, but service takes (placeId, url).
                // Let's modify service or fetch place here.
                // Doing lookup here is cleaner for service purity unless service fetches.
                // WebsiteChecker takes (placeId, url).
                const { PrismaClient } = await import('@lead-gen-my/db');
                const prisma = new PrismaClient();
                const place = await prisma.place.findUnique({ where: { id: placeId } });

                if (place?.websiteUrl) {
                    const result = await websiteChecker.check(placeId, place.websiteUrl);

                    if (result.status === 'ok') {
                        // Chain: Enqueue PSI and SCREENSHOT
                        await pipelineQueue.add(JobType.PSI_AUDIT, { placeId, url: result.resolvedUrl || place.websiteUrl }, {
                            jobId: `psi - ${placeId} `
                        });
                        await pipelineQueue.add(JobType.SCREENSHOT, { placeId, url: result.resolvedUrl || place.websiteUrl }, {
                            jobId: `screenshot - ${placeId} `
                        });
                    } else {
                        // If website broken, maybe skip PSI/Screenshots, but still do Scoring?
                        await pipelineQueue.add(JobType.SCORE, { placeId }, {
                            jobId: `score - ${placeId} `
                        });
                    }
                }
                break;
            }

            case JobType.PSI_AUDIT: {
                const allowed = await usageTracker.checkAndIncrement(METRICS.PSI_AUDIT, 1);
                if (!allowed) {
                    logger.warn({ jobId: job.id, type: job.name }, "Skipping PSI: Daily Limit Reached. (Set MAX_PSI_CALLS_PER_DAY env var to increase)");
                    return;
                }

                const { placeId, url } = job.data;
                await psiService.auditPlace(placeId, url, 'mobile');
                // Desktop audit?
                await psiService.auditPlace(placeId, url, 'desktop');

                // How to sync for LLM? LLM needs screenshot + PSI.
                // We can enqueue LLM from both PSI and Screenshot, but only run if both ready?
                // Or just enqueue LLM from here with a delay?
                // Or separate "Check Readiness" job?
                // Simpler: Try to enqueue LLM, and LLM service checks if data is ready. If not, fail/reschedule?
                // Or just enqueue LLM from *Screenshot* which takes longer usually?
                // Let's enqueue it from here but relying on Screenshot to be done.
                // Actually, Screenshot job is likely slower. Let Screenshot enqueue LLM.
                break;
            }

            case JobType.SCREENSHOT: {
                const allowed = await usageTracker.checkAndIncrement(METRICS.CAPTURE_SCREENSHOT, 1);
                if (!allowed) {
                    logger.warn({ jobId: job.id, type: job.name }, "Skipping Screenshot: Daily Limit Reached. (Set MAX_SCREENSHOTS_PER_DAY env var to increase)");
                    return;
                }

                const { placeId, url } = job.data;
                await screenshotService.processPlace(placeId, url);

                // Chain: Enqueue LLM
                // Chain: Enqueue LLM
                await pipelineQueue.add(JobType.LLM_VERDICT, { placeId }, {
                    jobId: `llm - ${placeId} `
                });
                break;
            }

            case JobType.LLM_VERDICT: {
                const allowed = await usageTracker.checkAndIncrement(METRICS.LLM_VERDICT, 1);
                if (!allowed) {
                    logger.warn({ jobId: job.id, type: job.name }, "Skipping LLM: Daily Limit Reached. (Set MAX_LLM_CALLS_PER_DAY env var to increase)");
                    return;
                }

                const { placeId } = job.data;
                // Service checks if data exists. If screenshot missing (race condition), 
                // it returns false. We might want to retry?
                // For now, assume Screenshot finished successfully.
                const success = await llmService.processPlace(placeId);

                // Chain: Score
                if (success || true) { // Always score even if LLM skipped
                    await pipelineQueue.add(JobType.SCORE, { placeId }, {
                        jobId: `score - ${placeId} `
                    });
                }
                break;
            }

            case JobType.SCORE: {
                const { placeId } = job.data;
                await scoringService.processPlace(placeId);
                break;
            }

            default:
                console.warn(`Unknown job type ${job.name}`);
        }
    } catch (err: any) {
        console.error(`Status failed for job ${job.id}(${job.name})`, err);
        throw err;
    }
};
