import { PrismaClient } from '@lead-gen-my/db';
import { calculateLeadScore, ScoreInput } from '@lead-gen-my/core';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
    const args = process.argv.slice(2);
    const limitIndex = args.indexOf('--limit');
    const limit = limitIndex !== -1 ? parseInt(args[limitIndex + 1], 10) : 500;

    console.log(`Starting Lead Scoring (Limit: ${limit})...`);

    // Fetch Candidates: Places (optionally filter those that need scoring update?)
    // For now, fetch recent places or just limits
    const places = await prisma.place.findMany({
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
        },
        take: limit
    });

    console.log(`Found ${places.length} places to score.`);

    for (const place of places) {
        // Construct Input
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

        // console.log(`Scoring ${place.name}: ${result.score} (${result.tier})`);

        // Upsert LeadScore
        try {
            await prisma.leadScore.create({
                data: {
                    placeId: place.id,
                    score: result.score,
                    tier: result.tier,
                    breakdown: result.breakdown as any // JSON
                }
            });
            // To prevent infinite history, maybe we should delete old or just keep creating?
            // Since "Upsert" usually implies maintaining one current state, but requirements said "Store LeadScore".
            // Schema has many-to-one, so history is preserved.

        } catch (err: any) {
            console.error(`Failed to save score for ${place.name}:`, err.message);
        }
    }

    console.log(`Scoring completed for ${places.length} places.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
