import { prisma } from '@lead-gen-my/db';

async function syncProblems() {
    console.log('Starting Primary Problem Synchronization...');

    const places = await prisma.place.findMany({
        include: {
            websiteCheck: true,
            llmVerdicts: { orderBy: { createdAt: 'desc' }, take: 1 },
            psiAudits: { where: { strategy: 'mobile' }, orderBy: { fetchedAt: 'desc' }, take: 1 }
        }
    });

    console.log(`Analyzing ${places.length} leads...`);

    let updatedCount = 0;

    for (const place of places) {
        let problem = "Limited online conversion optimisation";

        const site = place.websiteCheck;
        const verdict = place.llmVerdicts[0];
        const psi = place.psiAudits[0];

        // 1. No Website
        if (!place.websiteUrl) {
            problem = "No website – customers cannot find or contact them online";
        }
        // 2. Broken Website
        else if (site?.status === 'broken') {
            problem = "Website is broken or inaccessible";
        }
        // 3. High Severity LLM
        else if (verdict?.severity === 'high' && verdict.reasons) {
            try {
                const reasons = JSON.parse(verdict.reasons);
                if (reasons.length > 0) problem = reasons[0];
            } catch (e) { }
        }
        // 4. Poor Mobile (< 40)
        else if (psi && psi.performance !== null && psi.performance < 40) {
            problem = "Poor mobile experience drives users away";
        }

        await prisma.place.update({
            where: { id: place.id },
            data: { primaryProblem: problem }
        });

        updatedCount++;
        if (updatedCount % 10 === 0) console.log(`Processed ${updatedCount}/${places.length}...`);
    }

    console.log(`Success! Fixed primary problem for ${updatedCount} leads.`);
}

syncProblems().catch(err => {
    console.error('Problem sync failed:', err);
    process.exit(1);
});
