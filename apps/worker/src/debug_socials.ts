
import { PrismaClient } from '@lead-gen-my/db';

const prisma = new PrismaClient();

async function checkSocials() {
    const places = await prisma.place.findMany({
        where: { socials: { not: null } },
        take: 5
    });

    console.log(`Found ${places.length} places with socials:`);
    for (const p of places) {
        console.log(`[${p.name}] -> ${p.socials}`);
    }
}

checkSocials()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
