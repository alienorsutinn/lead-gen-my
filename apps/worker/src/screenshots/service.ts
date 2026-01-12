import { PrismaClient } from '@lead-gen-my/db';
import { ScreenshotEngine } from './screenshotEngine';
import fs from 'fs/promises';
import path from 'path';

const prisma = new PrismaClient();
const STORAGE_DIR = path.resolve(process.cwd(), 'apps/worker/storage/screenshots');

export class ScreenshotService {
    private engine = new ScreenshotEngine();

    constructor() {
        // Ensure storage exists
        // This constructor is sync, so we can't await fs calls easily here, 
        // relying on start-up scripts or lazy creation.
    }

    async init() {
        await this.engine.init();
        await fs.mkdir(STORAGE_DIR, { recursive: true });
    }

    async close() {
        await this.engine.close();
    }

    async processPlace(placeId: string, url: string) {
        // Ensure place-specific dir
        const placeDir = path.join(STORAGE_DIR, placeId);
        await fs.mkdir(placeDir, { recursive: true });

        const timestamp = Date.now();
        const results = [];

        // Mobile
        try {
            const mob = await this.engine.capture(url, { viewport: 'mobile' });
            const mobFilename = `${timestamp}-mobile.png`;
            const mobPath = path.join(placeDir, mobFilename);
            await fs.writeFile(mobPath, mob.buffer);

            await prisma.screenshot.create({
                data: {
                    placeId,
                    url: mob.finalUrl,
                    viewport: 'mobile',
                    pngPath: mobPath // Storing absolute logic path? Or relative? Requirements just say "pngPath". Storing full for now.
                }
            });
            results.push({ viewport: 'mobile', path: mobPath, status: 'ok' });
        } catch (err: any) {
            console.error(`Failed mobile screenshot for ${placeId}:`, err.message);
            results.push({ viewport: 'mobile', status: 'error', error: err.message });
        }

        // Desktop
        try {
            const dsk = await this.engine.capture(url, { viewport: 'desktop' });
            const dskFilename = `${timestamp}-desktop.png`;
            const dskPath = path.join(placeDir, dskFilename);
            await fs.writeFile(dskPath, dsk.buffer);

            await prisma.screenshot.create({
                data: {
                    placeId,
                    url: dsk.finalUrl,
                    viewport: 'desktop',
                    pngPath: dskPath
                }
            });
            results.push({ viewport: 'desktop', path: dskPath, status: 'ok' });

        } catch (err: any) {
            console.error(`Failed desktop screenshot for ${placeId}:`, err.message);
            results.push({ viewport: 'desktop', status: 'error', error: err.message });
        }

        return results;
    }
}
