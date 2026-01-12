'use server';

import { pipelineQueue } from '../lib/queue';
import { JobType } from '@lead-gen-my/core';
import { prisma } from '@lead-gen-my/db';
import { revalidatePath } from 'next/cache';

export async function triggerAnalysis(placeId: string) {
    console.log(`[Action] Triggering analysis for ${placeId}`);

    // Create a job for WEBSITE_CHECK which starts the pipeline
    // Note: We should probably ensure the place exists first?
    const place = await prisma.place.findUnique({ where: { id: placeId } });
    if (!place) throw new Error("Place not found");

    // Add job to queue
    await pipelineQueue.add(JobType.WEBSITE_CHECK, { placeId }, {
        jobId: `manual-trigger-${placeId}-${Date.now()}`
    });

    // Optimistically update status to 'IN_PROGRESS' or similar if we had that state
    // But for now, we just let the worker pick it up.
    // Maybe we add a Note?
    await prisma.note.create({
        data: {
            placeId,
            content: 'Analysis manually triggered via UI.'
        }
    });

    revalidatePath(`/opportunities/${place.slug || place.id}`);
    revalidatePath('/opportunities');

    return { success: true };
}
