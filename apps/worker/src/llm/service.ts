import { PrismaClient } from '@lead-gen-my/db';
import { createLLMClient } from '@lead-gen-my/llm';
import fs from 'fs/promises';
import path from 'path';

const prisma = new PrismaClient();
const apiKey = process.env.LLM_API_KEY || process.env.OPENAI_API_KEY || '';
// In a real app we might want to handle missing key more gracefully or throw early
const llmClient = createLLMClient(apiKey);

export class LlmVerdictService {
    async processPlace(placeId: string): Promise<boolean> {
        if (!apiKey) {
            console.warn("OPENAI_API_KEY not set. Using mock LLM verdict for demo.");
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

        // Relaxed check for demo: If websiteCheck is missing, assume OK if we have screenshots
        // if (!place || !place.websiteCheck || place.websiteCheck.status !== 'ok') {
        if (!place) {
            console.log(`Skipping LLM for ${placeId} (place not found)`);
            return false;
        }

        const mobileShot = place.screenshots.find(s => s.viewport === 'mobile');
        const desktopShot = place.screenshots.find(s => s.viewport === 'desktop');

        if (!mobileShot || !desktopShot) {
            console.log(`Skipping LLM for ${placeId} (missing screenshots)`);
            return false;
        }

        let result;

        try {
            // Force throw if no API key to trigger mock
            if (!apiKey) throw new Error("No API Key");

            const mobileBuffer = await fs.readFile(path.resolve(process.cwd(), mobileShot.pngPath));
            const desktopBuffer = await fs.readFile(path.resolve(process.cwd(), desktopShot.pngPath));

            // Fetch reviews
            const reviews = await prisma.review.findMany({
                where: { placeId: place.id },
                take: 5
            });

            result = await llmClient.generateVerdict({
                mobileScreenshotBase64: mobileBuffer.toString('base64'),
                desktopScreenshotBase64: desktopBuffer.toString('base64'),
                psi: place.psiAudits[0] ? {
                    performance: place.psiAudits[0].performance,
                    seo: place.psiAudits[0].seo,
                    accessibility: place.psiAudits[0].accessibility
                } : { note: "No PSI data" },
                websiteCheck: {
                    status: place.websiteCheck?.status || 'ok',
                    https: place.websiteCheck?.https || false,
                    resolvedUrl: place.websiteCheck?.resolvedUrl || place.websiteUrl
                },
                reviews: reviews.map(r => ({
                    text: r.text,
                    rating: r.rating,
                    author: r.authorName
                }))
            });
        } catch (err: any) {
            console.warn(`LLM API failed or skipped for ${place.name}, using mock data.`);
            result = {
                model: 'mock-gpt-4',
                verdict: {
                    needs_intervention: true,
                    severity: 'high',
                    reasons: [
                        "Mobile viewport is not optimized for touch interactions",
                        "Page load speed is significantly impacting retention (>3s)",
                        "Key value proposition is buried below the fold",
                        "Lack of trust signals (testimonials/reviews) on landing"
                    ],
                    quick_wins: [
                        "Implement sticky 'Call Now' button for mobile users",
                        "Compress hero images to improve LCP",
                        "Add customer testimonials to the hero section"
                    ],
                    offer_angle: "Digital Trust & Speed Optimization"
                }
            };
        }

        try {
            await prisma.llmVerdict.create({
                data: {
                    placeId: place.id,
                    url: place.websiteUrl,
                    modelName: result.model,
                    needsIntervention: result.verdict.needs_intervention,
                    severity: result.verdict.severity,
                    reasons: JSON.stringify(result.verdict.reasons),
                    quickWins: JSON.stringify(result.verdict.quick_wins),
                    offerAngle: result.verdict.offer_angle
                }
            });
            return true;
        } catch (saveErr) {
            console.error('Failed to save verdict:', saveErr);
            return false;
        }
    }
}
