
import { PrismaClient } from '@lead-gen-my/db';

const prisma = new PrismaClient();

async function check() {
    const places = await prisma.place.findMany({
        where: { name: { contains: 'Premier Clinic' } },
        include: {
            websiteCheck: true,
            screenshots: true,
            psiAudits: true,
            llmVerdicts: true
        }
    });

    console.log(`Found ${places.length} Premier Clinic records.`);
    for (const p of places) {
        console.log(`Place: ${p.name} (${p.id})`);
        console.log(`  WebsiteCheck: ${p.websiteCheck?.status} / ${p.websiteCheck?.url}`);
        console.log(`  Screenshots: ${p.screenshots.length}`);
        console.log(`  Verdicts: ${p.llmVerdicts.length}`);
    }
}

check()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
