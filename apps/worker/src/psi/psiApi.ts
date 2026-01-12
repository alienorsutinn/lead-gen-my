import { PrismaClient } from '@lead-gen-my/db';

const GOOGLE_PAGESPEED_API_KEY = process.env.GOOGLE_PAGESPEED_API_KEY || process.env.GOOGLE_PLACES_API_KEY;
const PSI_CACHE_DAYS = parseInt(process.env.PSI_CACHE_DAYS || '14', 10);

const prisma = new PrismaClient();

export interface PsiResult {
    performance: number | null;
    seo: number | null;
    accessibility: number | null;
    bestPractices: number | null;
    rawJson?: any;
}

export class PageSpeedApi {
    private async fetchPsi(url: string, strategy: 'mobile' | 'desktop'): Promise<any> {
        const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&strategy=${strategy}&category=performance&category=seo&category=accessibility&category=best-practices&key=${GOOGLE_PAGESPEED_API_KEY}`;

        try {
            const response = await fetch(apiUrl);
            if (!response.ok) {
                const text = await response.text();
                // 429 or 500 should ideally be retried, but keeping it simple for this module step 
                // unless we want to reuse the retry logic from placesApi (which would be good practice).
                // For now, throwing to let caller handle or fail.
                throw new Error(`PSI API failed: ${response.status} ${response.statusText} - ${text}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`Error fetching PSI for ${url} (${strategy}):`, error);
            throw error;
        }
    }

    async runPsi(url: string, strategy: 'mobile' | 'desktop'): Promise<PsiResult> {
        const data = await this.fetchPsi(url, strategy);

        const lighthouse = data.lighthouseResult;
        if (!lighthouse || !lighthouse.categories) {
            throw new Error('Invalid PSI response: missing lighthouse data');
        }

        const categories = lighthouse.categories;
        return {
            performance: categories.performance?.score ? Math.round(categories.performance.score * 100) : null,
            seo: categories.seo?.score ? Math.round(categories.seo.score * 100) : null,
            accessibility: categories['accessibility']?.score ? Math.round(categories['accessibility'].score * 100) : null,
            bestPractices: categories['best-practices']?.score ? Math.round(categories['best-practices'].score * 100) : null,
            // rawJson: data // Can include if we want full report, might be large for DB
        };
    }
}

export class PsiService {
    private api = new PageSpeedApi();

    async auditPlace(placeId: string, url: string, strategy: 'mobile' | 'desktop') {
        const cacheCutoff = new Date();
        cacheCutoff.setDate(cacheCutoff.getDate() - PSI_CACHE_DAYS);

        // Check if we have a recent audit
        const existing = await prisma.psiAudit.findFirst({
            where: {
                placeId,
                strategy,
                fetchedAt: {
                    gte: cacheCutoff
                }
            }
        });

        if (existing) {
            return { skipped: true, audit: existing };
        }

        // Run Audit
        try {
            const result = await this.api.runPsi(url, strategy);

            // Save to DB
            // Using create because we might want history, but the requirements said "Upsert" logic vaguely 
            // or "Do not re-run". The schema doesn't enforce unique strategy per placeId, so create adds a new record.
            // If we only want the *latest* per strategy, we could adhere to that, but audits are historical.
            // However, usually we query the latest. Let's create a new one.

            const saved = await prisma.psiAudit.create({
                data: {
                    placeId,
                    url,
                    strategy,
                    performance: result.performance,
                    seo: result.seo,
                    accessibility: result.accessibility,
                    bestPractices: result.bestPractices,
                    rawJson: result.rawJson || undefined
                }
            });

            return { skipped: false, audit: saved };

        } catch (error) {
            // Log error but don't crash process
            console.error(`Failed to audit ${url} (${strategy}):`, error);
            return { skipped: false, error };
        }
    }
}
