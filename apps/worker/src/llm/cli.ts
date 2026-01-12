import { PrismaClient } from '@lead-gen-my/db';
import { createLLMClient } from '@lead-gen-my/llm';
import fs from 'fs/promises';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const prisma = new PrismaClient();
const apiKey = process.env.OPENAI_API_KEY || '';
const llmClient = createLLMClient(apiKey);

async function main() {
    if (!apiKey) {
        console.error("OPENAI_API_KEY not set.");
        process.exit(1);
    }

    const args = process.argv.slice(2);
    const limitIndex = args.indexOf('--limit');
    const limit = limitIndex !== -1 ? parseInt(args[limitIndex + 1], 10) : 10;

    console.log(`Starting LLM Verdict Generation (Limit: ${limit})...`);

    // Fetch Candidates
    // Requirements: Screenshots + PSI + WebsiteCheck
    // Ideally we want places that DO NOT have a recent verdict?
    const places = await prisma.place.findMany({
        where: {
            websiteCheck: { status: 'ok' }, // Only analyze live sites
            screenshots: { some: {} },      // Must have screenshots
            // psiAudits: { some: {} }      // Optional? Better if present.
            llmVerdicts: { none: {} }       // Only process those without verdicts for this run
        },
        include: {
            screenshots: true,
            psiAudits: {
                // Get latest mobile audit
                where: { strategy: 'mobile' },
                orderBy: { fetchedAt: 'desc' },
                take: 1
            },
            websiteCheck: true
        },
        take: limit
    });

    console.log(`Found ${places.length} candidates for analysis.`);

    for (const place of places) {
        console.log(`Analyzing ${place.name}...`);

        try {
            // Prepare inputs
            const mobileShot = place.screenshots.find(s => s.viewport === 'mobile');
            const desktopShot = place.screenshots.find(s => s.viewport === 'desktop');
            const psi = place.psiAudits[0];
            const siteCheck = place.websiteCheck;

            if (!mobileShot || !desktopShot) {
                console.log(`  > Skipping: Missing screenshots.`);
                continue;
            }

            // Read files
            // Assumes pngPath is accessible (absolute or relative to cwd)
            // If paths are relative to worker root, ensuring resolve
            const mobileBuffer = await fs.readFile(path.resolve(process.cwd(), mobileShot.pngPath));
            const desktopBuffer = await fs.readFile(path.resolve(process.cwd(), desktopShot.pngPath));

            const result = await llmClient.generateVerdict({
                mobileScreenshotBase64: mobileBuffer.toString('base64'),
                desktopScreenshotBase64: desktopBuffer.toString('base64'),
                psi: psi ? {
                    performance: psi.performance,
                    seo: psi.seo,
                    accessibility: psi.accessibility
                } : { note: "No PSI data" },
                websiteCheck: {
                    status: siteCheck?.status,
                    https: siteCheck?.https,
                    resolvedUrl: siteCheck?.resolvedUrl
                }
            });

            console.log(`  > Verdict: Intervention=${result.verdict.needs_intervention} (${result.verdict.severity})`);
            console.log(`  > Angle: ${result.verdict.offer_angle}`);

            // Save to DB
            await prisma.llmVerdict.create({
                data: {
                    placeId: place.id,
                    url: place.websiteUrl,
                    modelName: result.model,
                    needsIntervention: result.verdict.needs_intervention,
                    severity: result.verdict.severity,
                    reasons: result.verdict.reasons as any, // Json type
                    quickWins: result.verdict.quick_wins as any, // Json type
                    offerAngle: result.verdict.offer_angle
                }
            });

        } catch (err: any) {
            console.error(`  > Failed analysis for ${place.name}:`, err.message);
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
