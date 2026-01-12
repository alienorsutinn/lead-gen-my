import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET(req: NextRequest, { params }: { params: { path: string[] } }) {
    try {
        const filePath = params.path.join('/');

        // Security: Prevent traversal
        if (filePath.includes('..')) {
            return new NextResponse('Invalid path', { status: 400 });
        }

        // Locate storage dir (apps/worker/storage/screenshots)
        // Assume apps/web runs from /apps/web, so ../worker/storage
        // Adjust based on where Next.js runs (cwd is usually project root in monorepo if run via Turbo, but let's assume worst case)
        // Ideally rely on an env var or relative known path.
        // CWD in `next dev` is `apps/web`.
        const storageRoot = path.resolve(process.cwd(), '../worker/storage/screenshots');
        const fullPath = path.join(storageRoot, filePath);

        try {
            const fileBuffer = await fs.readFile(fullPath);
            return new NextResponse(fileBuffer, {
                headers: {
                    'Content-Type': 'image/png',
                    'Cache-Control': 'public, max-age=31536000, immutable'
                }
            });
        } catch (e) {
            return new NextResponse('File not found', { status: 404 });
        }

    } catch (e) {
        console.error("Screenshot Error", e);
        return new NextResponse('Internal Error', { status: 500 });
    }
}
