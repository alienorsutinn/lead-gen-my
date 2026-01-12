import { PrismaClient } from '@lead-gen-my/db';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
    const reviewCount = await prisma.review.count();
    console.log(`Total Reviews in DB: ${reviewCount}`);

    const reviews = await prisma.review.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { place: true }
    });

    for (const r of reviews) {
        console.log(`[${r.place.name}] ${r.rating} stars: "${r.text.substring(0, 50)}..."`);
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
