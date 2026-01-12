'use server';

import { prisma } from '@lead-gen-my/db';
import { Prisma } from '@prisma/client';

export type LeadFilter = {
    search?: string;
    tier?: string;
    minRating?: number;
    hasWebsite?: boolean;
    needsIntervention?: boolean;
    limit?: number;
};

// Helper to build where clause
function buildWhere(filters: LeadFilter): Prisma.PlaceWhereInput {
    const where: Prisma.PlaceWhereInput = {};

    if (filters.search) {
        where.OR = [
            { name: { contains: filters.search } },
            { address: { contains: filters.search } }
        ];
    }

    if (filters.minRating) {
        where.rating = { gte: Number(filters.minRating) };
    }

    if (filters.hasWebsite !== undefined) {
        // Handle boolean or string 'true'/'false' if passed from query params generic
        const val = String(filters.hasWebsite) === 'true';
        if (val) {
            where.websiteUrl = { not: null };
        } else {
            // If specifically checking for NO website
            // But if undefined, we don't filter. 
            // Logic in page passes 'true' or 'false'.
            if (String(filters.hasWebsite) === 'false') where.websiteUrl = null;
        }
    }

    if (filters.tier) {
        where.leadScores = {
            some: { tier: filters.tier as any }
        };
    }

    if (filters.needsIntervention !== undefined) {
        const val = String(filters.needsIntervention) === 'true';
        where.llmVerdicts = { some: { needsIntervention: val } };
    }

    return where;
}

export async function getLeads(page: number = 1, limit: number = 20, filters: LeadFilter = {}) {
    const where = buildWhere(filters);

    const [data, total] = await Promise.all([
        prisma.place.findMany({
            where,
            include: {
                leadScores: { orderBy: { computedAt: 'desc' }, take: 1 },
                llmVerdicts: { orderBy: { createdAt: 'desc' }, take: 1 },
                websiteCheck: true
            },
            // skip: (page - 1) * limit, // Pagination breaks sorting so we fetch all matching constraints then sort/slice
            // For MVP this is fine if total < 500. If > 500, we should sort in SQL or accept partial sort.
            // Following user hack: "fetch the leads including latest score, sort in JS"
            // We'll keep limits for safety but move slice after.
            take: 500, // Fetch more to sort
            orderBy: { createdAt: 'desc' }
        }),
        prisma.place.count({ where })
    ]);

    // Sort by:
    // 1. Tier (A > B > C)
    // 2. Score (Higher first)
    // 3. Review Count (Higher first)
    data.sort((a, b) => {
        const tierOrder: Record<string, number> = { 'A': 0, 'B': 1, 'C': 2 };
        const tierA = a.leadScores[0]?.tier || 'C';
        const tierB = b.leadScores[0]?.tier || 'C';

        if (tierOrder[tierA] !== tierOrder[tierB]) {
            return tierOrder[tierA] - tierOrder[tierB];
        }

        const scoreA = a.leadScores[0]?.score ?? -1;
        const scoreB = b.leadScores[0]?.score ?? -1;
        if (scoreA !== scoreB) return scoreB - scoreA;

        const reviewsA = a.userRatingCount || 0;
        const reviewsB = b.userRatingCount || 0;
        return reviewsB - reviewsA;
    });

    // Manual Pagination Slice
    const currentLimit = filters.limit ? Number(filters.limit) : limit;
    const paginatedData = data.slice((page - 1) * currentLimit, page * currentLimit);

    return { data: paginatedData, total, page, limit: currentLimit };
}

export async function getLeadDetails(id: string) {
    return prisma.place.findUnique({
        where: { id },
        include: {
            leadScores: { orderBy: { computedAt: 'desc' } },
            llmVerdicts: { orderBy: { createdAt: 'desc' } },
            websiteCheck: true,
            psiAudits: { orderBy: { fetchedAt: 'desc' } },
            screenshots: true
        }
    });
}

export async function exportLeadsAsCsv(filters: LeadFilter) {
    const where = buildWhere(filters);
    const leads = await prisma.place.findMany({
        where,
        include: {
            leadScores: { orderBy: { computedAt: 'desc' }, take: 1 },
            llmVerdicts: { orderBy: { createdAt: 'desc' }, take: 1 },
            websiteCheck: true
        },
        take: 5000,
        orderBy: { createdAt: 'desc' }
    });

    if (!leads.length) return null;

    // Header
    const header = ['Name', 'Address', 'Phone', 'Rating', 'Reviews', 'Website', 'Tier', 'Score', 'Intervention', 'Angle', 'Reasons'];
    const rows = leads.map(l => {
        const score = l.leadScores[0];
        const verdict = l.llmVerdicts[0];
        let reasons: string[] = [];
        try {
            if (verdict?.reasons) {
                reasons = JSON.parse(verdict.reasons);
            }
        } catch (e) {
            reasons = [];
        }

        return [
            l.name,
            l.address || '',
            l.phone || '',
            l.rating?.toString() || '',
            l.userRatingCount?.toString() || '',
            l.websiteUrl || '',
            score?.tier || '',
            score?.score?.toString() || '',
            verdict?.needsIntervention ? 'YES' : 'NO',
            verdict?.offerAngle || '',
            reasons.join('; ')
        ].map(cell => `"${(cell || '').replace(/"/g, '""')}"`).join(','); // Escape CSV
    });

    return [header.join(','), ...rows].join('\n');
}
