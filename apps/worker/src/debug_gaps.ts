
import { PrismaClient } from '@lead-gen-my/db';

const prisma = new PrismaClient();

async function checkDataGaps() {
    const places = await prisma.place.findMany({
        take: 5,
        include: {
            psiAudits: true,
            screenshots: true,
            websiteCheck: true
        }
    });

    console.log("--- Data Gap Analysis ---");
    for (const p of places) {
        console.log(`[${p.name}]`);
        console.log(`  PSI: ${p.psiAudits.length} records. (Mobile perf: ${p.psiAudits.find(a => a.strategy === 'mobile')?.performance})`);
        console.log(`  Screenshots: ${p.screenshots.map(s => s.viewport).join(', ')}`);
        console.log(`  Website: ${p.websiteCheck?.status}`);
    }
}

checkDataGaps()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
