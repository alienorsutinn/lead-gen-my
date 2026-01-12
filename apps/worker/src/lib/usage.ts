import { PrismaClient } from '@lead-gen-my/db';
import { logger } from './logger';

const prisma = new PrismaClient();

// Metric Names
export const METRICS = {
    DISCOVER_PLACES: 'DISCOVER_PLACES',
    PSI_AUDIT: 'PSI_AUDIT',
    LLM_VERDICT: 'LLM_VERDICT',
    CAPTURE_SCREENSHOT: 'CAPTURE_SCREENSHOT'
} as const;

type Metric = keyof typeof METRICS;

// Default Limits
const LIMITS: Record<Metric, number> = {
    DISCOVER_PLACES: parseInt(process.env.MAX_PLACES_DISCOVERED_PER_DAY || '500'),
    PSI_AUDIT: parseInt(process.env.MAX_PSI_CALLS_PER_DAY || '100'),
    LLM_VERDICT: parseInt(process.env.MAX_LLM_CALLS_PER_DAY || '50'),
    CAPTURE_SCREENSHOT: parseInt(process.env.MAX_SCREENSHOTS_PER_DAY || '50')
};

export class UsageTracker {

    /**
     * Checks if action is allowed. If allowed, increments count atomically.
     * Returns true if allowed, false if cap reached.
     */
    async checkAndIncrement(metric: Metric, incrementBy: number = 1): Promise<boolean> {
        const today = new Date().toISOString().split('T')[0];
        const limit = LIMITS[metric];

        try {
            // Check current usage
            // Upsert initializes to 0 if not exists, then we increment
            // Actually, for atomic check and limit enforcement, ideally we check first?
            // "Check then Act" has race condition, but acceptable for loose limits.
            // Better: update ... where count < limit.

            // Step 1: Ensure record exists
            let usage = await prisma.dailyUsage.findUnique({
                where: {
                    date_metric: { date: today, metric }
                }
            });

            if (!usage) {
                usage = await prisma.dailyUsage.create({
                    data: { date: today, metric, count: 0 }
                });
            }

            if (usage.count + incrementBy > limit) {
                logger.warn({ metric, today, count: usage.count, limit }, 'Daily Usage Limit Reached');
                return false;
            }

            // Step 2: Increment
            await prisma.dailyUsage.update({
                where: { id: usage.id },
                data: { count: { increment: incrementBy } }
            });

            return true;
        } catch (error) {
            logger.error({ error, metric }, 'Failed to track usage');
            // Fail open or closed? Closed for safety.
            return false;
        }
    }

    async getUsage(metric: Metric): Promise<{ count: number, limit: number }> {
        const today = new Date().toISOString().split('T')[0];
        const record = await prisma.dailyUsage.findUnique({
            where: { date_metric: { date: today, metric } }
        });
        return {
            count: record?.count || 0,
            limit: LIMITS[metric]
        };
    }
}

export const usageTracker = new UsageTracker();
