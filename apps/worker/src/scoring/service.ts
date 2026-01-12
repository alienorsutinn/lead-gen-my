import { PrismaClient } from '@lead-gen-my/db';
import { calculateLeadScore, ScoreInput } from '@lead-gen-my/core';

const prisma = new PrismaClient();

export class LeadScoringService {
    async processPlace(placeId: string): Promise<boolean> {
        const place = await prisma.place.findUnique({
            where: { id: placeId },
            include: {
                websiteCheck: true,
                psiAudits: {
                    where: { strategy: 'mobile' },
                    orderBy: { fetchedAt: 'desc' },
                    take: 1
                },
                llmVerdicts: {
                    orderBy: { createdAt: 'desc' },
                    take: 1
                }
            }
        });

        if (!place) {
            console.log(`Skipping Score for ${placeId} (not found)`);
            return false;
        }

        const input: ScoreInput = {
            rating: place.rating,
            userRatingCount: place.userRatingCount,
            websiteUrl: place.websiteUrl,
            websiteCheck: place.websiteCheck ? {
                status: place.websiteCheck.status,
                https: place.websiteCheck.https
            } : null,
            psi: place.psiAudits[0] ? {
                seo: place.psiAudits[0].seo,
                performance: place.psiAudits[0].performance
            } : null,
            llmVerdict: place.llmVerdicts[0] ? {
                needsIntervention: place.llmVerdicts[0].needsIntervention
            } : null
        };

        const result = calculateLeadScore(input);

        await prisma.leadScore.create({
            data: {
                placeId: place.id,
                score: result.score,
                tier: result.tier,
                breakdown: result.breakdown as any
            }
        });

        console.log(`Score calculated for ${place.name || placeId}: ${result.score} (${result.tier})`);
        return true;
    }
}
