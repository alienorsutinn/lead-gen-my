import { PrismaClient } from '@lead-gen-my/db';
import { WebsiteChecker } from './websiteChecker';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();
const checker = new WebsiteChecker();

async function main() {
    console.log('Fetching places with websites to check...');

    // Fetch places that have a websiteUrl
    // Optimization: could add flag to only check ones without existing WebsiteCheck
    const places = await prisma.place.findMany({
        where: {
            websiteUrl: {
                not: null
            }
        },
        select: {
            placeId: true, // Use the unique placeId string (e.g. Google Place ID)
            id: true,      // Internal UUID
            websiteUrl: true,
            name: true
        },
        take: 100 // Process in batches/limit for this manual CLI
    });

    console.log(`Found ${places.length} places with websites.`);

    for (const place of places) {
        if (!place.websiteUrl) continue;

        console.log(`Checking ${place.name} (${place.websiteUrl})...`);
        const result = await checker.check(place.id, place.websiteUrl);

        console.log(`  > ${result.status} [HTTP ${result.httpStatus || 'N/A'}] -> ${result.resolvedUrl || 'N/A'}`);
        if (result.errors) {
            console.log(`  > Error: ${result.errors}`);
        }
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
