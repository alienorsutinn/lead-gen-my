'use server';

import { prisma } from '@lead-gen-my/db';

export async function getDailyUsage() {
    const today = new Date().toISOString().split('T')[0];
    const usage = await prisma.dailyUsage.findMany({
        where: { date: today }
    });

    // Convert to map or object
    const metrics: Record<string, number> = {};
    usage.forEach(u => {
        metrics[u.metric] = u.count;
    });

    return metrics;
}
