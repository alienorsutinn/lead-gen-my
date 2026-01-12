import { PrismaClient } from '@lead-gen-my/db';
import { ScreenshotService } from './service';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();
const service = new ScreenshotService();
const CONCURRENCY = parseInt(process.env.SCREENSHOT_CONCURRENCY || '2', 10);

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

    console.log(`Starting Screenshots (Limit: ${limit}, Concurrency: ${CONCURRENCY})...`);

    // Fetch Candidates
    // Must have websiteUrl and WebsiteCheck.status = 'ok'
    const places = await prisma.place.findMany({
        where: {
            websiteUrl: { not: null },
            websiteCheck: {
                status: 'ok'
            }
        },
        select: { id: true, websiteUrl: true, name: true, websiteCheck: { select: { resolvedUrl: true } } },
        take: limit
    });

    console.log(`Found ${places.length} places with verified websites.`);

    await service.init();
    const semaphore = new Semaphore(CONCURRENCY);
    const processPromises: Promise<void>[] = [];
    let completed = 0;

    for (const place of places) {
        const urlToUse = place.websiteCheck?.resolvedUrl || place.websiteUrl;
        if (!urlToUse) continue;

        const task = async () => {
            await semaphore.acquire();
            try {
                console.log(`Capturing ${place.name} (${urlToUse})...`);
                const results = await service.processPlace(place.id, urlToUse);

                const okCount = results.filter(r => r.status === 'ok').length;
                console.log(`  > ${place.name}: Captured ${okCount}/2 screenshots.`);
                if (okCount === 2) completed++;

            } catch (err: any) {
                console.error(`Error processing ${place.name}:`, err.message);
            } finally {
                semaphore.release();
            }
        };
        processPromises.push(task());
    }

    await Promise.all(processPromises);
    await service.close();
    console.log(`Done. Fully captured ${completed} places.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
