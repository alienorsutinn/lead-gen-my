import { PrismaClient } from '@lead-gen-my/db';
import { createLLMClient } from '@lead-gen-my/llm';
import fs from 'fs/promises';
import path from 'path';

const prisma = new PrismaClient();
const apiKey = process.env.OPENAI_API_KEY || '';
// In a real app we might want to handle missing key more gracefully or throw early
const llmClient = createLLMClient(apiKey);

export class LlmVerdictService {
    async processPlace(placeId: string): Promise<boolean> {
        if (!apiKey) {
            console.error("OPENAI_API_KEY not set.");
            return false;
        }

        const place = await prisma.place.findUnique({
            where: { id: placeId },
            include: {
                screenshots: true,
                psiAudits: {
                    where: { strategy: 'mobile' },
                    orderBy: { fetchedAt: 'desc' },
                    take: 1
                },
                websiteCheck: true
            }
        });

        if (!place || !place.websiteCheck || place.websiteCheck.status !== 'ok') {
            console.log(`Skipping LLM for ${placeId} (missing data or site not ok)`);
            return false;
        }

        const mobileShot = place.screenshots.find(s => s.viewport === 'mobile');
        const desktopShot = place.screenshots.find(s => s.viewport === 'desktop');

        if (!mobileShot || !desktopShot) {
            console.log(`Skipping LLM for ${placeId} (missing screenshots)`);
            return false;
        }

        try {
            const mobileBuffer = await fs.readFile(path.resolve(process.cwd(), mobileShot.pngPath));
            const desktopBuffer = await fs.readFile(path.resolve(process.cwd(), desktopShot.pngPath));

            const result = await llmClient.generateVerdict({
                mobileScreenshotBase64: mobileBuffer.toString('base64'),
                desktopScreenshotBase64: desktopBuffer.toString('base64'),
                psi: place.psiAudits[0] ? {
                    performance: place.psiAudits[0].performance,
                    seo: place.psiAudits[0].seo,
                    accessibility: place.psiAudits[0].accessibility
                } : { note: "No PSI data" },
                websiteCheck: {
                    status: place.websiteCheck!.status,
                    https: place.websiteCheck!.https,
                    resolvedUrl: place.websiteCheck!.resolvedUrl
                }
            });

            await prisma.llmVerdict.create({
                data: {
                    placeId: place.id,
                    url: place.websiteUrl,
                    modelName: result.model,
                    needsIntervention: result.verdict.needs_intervention,
                    severity: result.verdict.severity,
                    reasons: result.verdict.reasons as any,
                    quickWins: result.verdict.quick_wins as any,
                    offerAngle: result.verdict.offer_angle
                }
            });
            return true;

        } catch (err: any) {
            console.error(`Failed LLM analysis for ${place.name}:`, err.message);
            throw err;
        }
    }
}
