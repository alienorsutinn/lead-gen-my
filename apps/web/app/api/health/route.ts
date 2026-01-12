import { NextResponse } from 'next/server';
import { prisma } from '@lead-gen-my/db';

export async function GET() {
    let dbStatus = 'disconnected';
    try {
        await prisma.$queryRaw`SELECT 1`;
        dbStatus = 'connected';
    } catch (e) {
        dbStatus = 'error';
    }

    return NextResponse.json({
        status: 'ok',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        database: dbStatus
    });
}
