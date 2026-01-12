import { prisma } from '@lead-gen-my/db';
import { UxAuditEngine } from './uxAuditEngine';
import path from 'path';

const AUDIT_OUTPUT_DIR = path.resolve(process.cwd(), 'public/evidence');
// NOTE: Ideally we upload to S3, but for now we store locally in a place the web app can maybe access 
// OR we store in worker data dir and serve via an API route that reads it.
// Given constraints: "serve stored UX evidence images similar to screenshot serving" -> we'll stick to a local dir that we can configure.

export class UxAuditService {
    private engine: UxAuditEngine;

    constructor() {
        this.engine = new UxAuditEngine();
    }

    async auditPlace(placeId: string) {
        // 1. Get Place & URL
        const place = await prisma.place.findUnique({
            where: { placeId },
            include: { websiteCheck: true }
        });

        if (!place || !place.websiteUrl) {
            console.log(`[UxAudit] Skipping ${placeId} - no website`);
            return;
        }

        const urlToTest = place.websiteCheck?.resolvedUrl || place.websiteUrl;

        // 2. Run Audit
        try {
            console.log(`[UxAudit] Starting audit for ${place.name} (${urlToTest})...`);

            // Ensure engine is initialized
            const result = await this.engine.auditUrl(
                urlToTest,
                placeId,
                // We'll store in a shared persistent volume or just a local folder that we can serve
                // For a monorepo local dev, let's put it in `apps/web/public/evidence` so it's immediately visible?
                // Or keep it in `apps/worker/data/evidence` and have an API route verify/stream it.
                // Let's stick to `apps/worker/data/evidence` to be clean.
                path.resolve(process.cwd(), 'data/evidence')
            );

            // 3. Save to DB
            await prisma.uxAudit.create({
                data: {
                    placeId: place.id, // Use internal UUID
                    url: urlToTest,
                    finalUrl: result.finalUrl,
                    viewport: result.viewport,
                    ttcAboveFoldMs: result.ttcAboveFoldMs,
                    clicksToContact: result.clicksToContact,
                    contactMethods: JSON.stringify(result.contactMethods),
                    blockers: JSON.stringify(result.blockers),
                    evidencePngPath: result.evidencePngPath,
                }
            });

            console.log(`[UxAudit] Completed for ${place.name}. Evidence: ${result.evidencePngPath}`);

        } catch (e) {
            console.error(`[UxAudit] Failed for ${placeId}:`, e);
        }
    }
}
