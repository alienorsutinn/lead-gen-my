import { PrismaClient } from '@lead-gen-my/db';
import { ReviewService } from './service';

const prisma = new PrismaClient();

async function main() {
    const args = process.argv.slice(2);
    const limitIndex = args.indexOf('--limit');
    const limit = limitIndex !== -1 ? parseInt(args[limitIndex + 1], 10) : 10;

    const countIndex = args.indexOf('--count');
    const targetCount = countIndex !== -1 ? parseInt(args[countIndex + 1], 10) : 100;

    console.log(`Starting Review Scraper (Places Limit: ${limit}, Review Target: ${targetCount})...`);

    // Find places with Google Maps URL but no deep reviews yet (heuristically check if they have < 10 reviews)
    const places = await prisma.place.findMany({
        where: {
            googleMapsUrl: { not: null },
        },
        include: {
            _count: {
                select: { reviews: true }
            }
        },
        orderBy: {
            createdAt: 'desc'
        },
        take: limit
    });

    console.log(`Found ${places.length} places to scrape reviews for.`);

    const service = new ReviewService();

    for (const place of places) {
        if (!place.googleMapsUrl) continue;
        console.log(`\n--- ${place.name} (${place.id}) ---`);
        await service.fetchReviews(place.id, place.googleMapsUrl, targetCount);
    }

    // Close browser if service keeps one open (our impl opens per call currently)
    // await service.close(); 
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
