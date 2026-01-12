import { PrismaClient } from '@lead-gen-my/db';

const prisma = new PrismaClient();

async function resetVerdict() {
    const place = await prisma.place.findFirst({
        where: { name: { contains: 'Premier Clinic' } }
    });

    if (place) {
        console.log(`Resetting verdicts for ${place.name}...`);
        await prisma.llmVerdict.deleteMany({
            where: { placeId: place.id }
        });
        console.log("Deleted old verdicts.");
    }
}

resetVerdict()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
