import { PrismaClient } from '@lead-gen-my/db';
import { ReviewService } from './service';

const prisma = new PrismaClient();

async function main() {
    const args = process.argv.slice(2);
    const limitIndex = args.indexOf('--limit');
    const limit = limitIndex !== -1 ? parseInt(args[limitIndex + 1], 10) : 5;

    console.log(`Starting Review Scraper (Limit: ${limit})...`);

    // Find places with Google Maps URL but no reviews yet (or just update recent ones)
    const places = await prisma.place.findMany({
        where: {
            googleMapsUrl: { not: null },
            reviews: { none: {} }
        },
        take: limit
    });

    console.log(`Found ${places.length} places to scrape reviews for.`);

    const service = new ReviewService();

    for (const place of places) {
        if (!place.googleMapsUrl) continue;
        await service.fetchReviews(place.id, place.googleMapsUrl);
    }

    // Close browser if service keeps one open (our impl opens per call currently)
    // await service.close(); 
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
