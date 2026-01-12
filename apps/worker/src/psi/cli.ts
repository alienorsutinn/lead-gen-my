import { PrismaClient } from '@lead-gen-my/db';
import { PsiService } from './psiApi';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();
const psiService = new PsiService();
const CONCURRENCY = parseInt(process.env.PSI_CONCURRENCY || '2', 10);

class Semaphore {
    private tasks: (() => void)[] = [];
    private count = CONCURRENCY;

    constructor(concurrency: number) {
        this.count = concurrency;
    }

    async acquire() {
        if (this.count > 0) {
            this.count--;
            return;
        }
        await new Promise<void>(resolve => this.tasks.push(resolve));
    }

    release() {
        this.count++;
        if (this.tasks.length > 0) {
            this.count--;
            const next = this.tasks.shift();
            if (next) next();
        }
    }
}

async function main() {
    const args = process.argv.slice(2);
    const limitIndex = args.indexOf('--limit');
    const limit = limitIndex !== -1 ? parseInt(args[limitIndex + 1], 10) : 10;

    console.log(`Starting PSI Audit (Limit: ${limit}, Concurrency: ${CONCURRENCY})...`);

    // 1. Get candidates: Places with websiteUrl
    // Optimization: filtering by those needing updates would be better done in SQL to respect limit,
    // but for now fetching potential candidates and filtering via service "check cache" logic is safer/simpler
    // given complex "latest valid audit" logic for both strategies.
    // Better yet: exclude ones that have *recent* audits for BOTH strategies?
    // Doing simple fetch for now.

    // Cache cutoff
    const cacheCutoff = new Date();
    cacheCutoff.setDate(cacheCutoff.getDate() - (parseInt(process.env.PSI_CACHE_DAYS || '14', 10)));

    const places = await prisma.place.findMany({
        where: {
            websiteUrl: { not: null },
            // Rudimentary optimization: try to find places that DON'T have a recent audit
            // This is complex in Prisma without raw SQL for "ALL strategies present".
            // So we'll fetch places and let the service skip if needed, but apply limit to *processed* items?
            // applying limit to fetch is safer to avoid OOM on huge DB.
        },
        select: { id: true, websiteUrl: true, name: true },
        take: limit * 2 // Fetch extra in case some are skipped
    });

    console.log(`Found ${places.length} potential candidates.`);

    const semaphore = new Semaphore(CONCURRENCY);
    const processPromises: Promise<void>[] = [];
    let processedCount = 0;

    for (const place of places) {
        if (processedCount >= limit) break;
        if (!place.websiteUrl) continue;

        const task = async () => {
            await semaphore.acquire();
            try {
                console.log(`Auditing ${place.name}...`);

                // Run Mobile
                const mobRes = await psiService.auditPlace(place.id, place.websiteUrl!, 'mobile');
                if (!mobRes.skipped) {
                    console.log(`  > Mobile: Performace=${mobRes.audit?.performance}, SEO=${mobRes.audit?.seo}`);
                } else {
                    console.log(`  > Mobile: Skipped (Cached)`);
                }

                // Run Desktop
                const dskRes = await psiService.auditPlace(place.id, place.websiteUrl!, 'desktop');
                if (!dskRes.skipped) {
                    console.log(`  > Desktop: Performace=${dskRes.audit?.performance}, SEO=${dskRes.audit?.seo}`);
                } else {
                    console.log(`  > Desktop: Skipped (Cached)`);
                }

                if (!mobRes.skipped || !dskRes.skipped) {
                    processedCount++;
                }

            } catch (err) {
                console.error(`Error processing ${place.name}:`, err);
            } finally {
                semaphore.release();
            }
        };
        processPromises.push(task());
    }

    await Promise.all(processPromises);
    console.log(`Done. Processed (newly audited) ${processedCount} places.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
