'use server';

import { prisma } from '@lead-gen-my/db';
import { Prisma } from '@prisma/client';

export type OpportunityFilter = {
    search?: string;
    tier?: string;
    minRating?: number;
    minReviews?: number;
    hasWebsite?: boolean;
    needsIntervention?: boolean;
    opportunityType?: 'no_website' | 'broken_website' | 'poor_mobile' | 'seo_opportunity';
    area?: string;
    limit?: number;
};

// Helper to build where clause
function buildWhere(filters: OpportunityFilter): Prisma.PlaceWhereInput {
    const where: Prisma.PlaceWhereInput = {};

    if (filters.search) {
        where.OR = [
            { name: { contains: filters.search } },
            { address: { contains: filters.search } }
        ];
    }

    if (filters.minRating) {
        where.rating = { gte: filters.minRating };
    }

    if (filters.minReviews) {
        where.userRatingCount = { gte: filters.minReviews };
    }

    if (filters.area) {
        where.address = { contains: filters.area };
    }

    if (filters.tier) {
        where.opportunities = {
            some: { tier: filters.tier as any }
        };
    }

    if (filters.opportunityType) {
        if (filters.opportunityType === 'no_website') {
            where.websiteUrl = null;
        } else if (filters.opportunityType === 'broken_website') {
            where.websiteCheck = { status: 'broken' };
        } else if (filters.opportunityType === 'poor_mobile') {
            where.llmVerdicts = { some: { needsIntervention: true } };
        } else if (filters.opportunityType === 'seo_opportunity') {
            where.llmVerdicts = { some: { offerAngle: { contains: 'seo' } } };
        }
    }

    if (filters.hasWebsite !== undefined) {
        if (String(filters.hasWebsite) === 'true') where.websiteUrl = { not: null };
        else where.websiteUrl = null;
    }

    return where;
}

export async function getOpportunities(page: number = 1, limit: number = 20, filters: OpportunityFilter = {}) {
    const where = buildWhere(filters);

    const [data, total] = await Promise.all([
        prisma.place.findMany({
            where,
            include: {
                opportunities: { orderBy: { computedAt: 'desc' }, take: 1 },
                llmVerdicts: { orderBy: { createdAt: 'desc' }, take: 1 },
                websiteCheck: true
            },
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
        const tierA = a.opportunities[0]?.tier || 'C';
        const tierB = b.opportunities[0]?.tier || 'C';

        if (tierOrder[tierA] !== tierOrder[tierB]) {
            return tierOrder[tierA] - tierOrder[tierB];
        }

        const scoreA = a.opportunities[0]?.score || 0;
        const scoreB = b.opportunities[0]?.score || 0;
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

export async function getOpportunityDetails(idOrSlug: string) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);

    return prisma.place.findFirst({
        where: isUuid ? { id: idOrSlug } : { slug: idOrSlug },
        include: {
            opportunities: { orderBy: { computedAt: 'desc' } },
            llmVerdicts: { orderBy: { createdAt: 'desc' } },
            websiteCheck: true,
            psiAudits: { orderBy: { fetchedAt: 'desc' } },
            screenshots: true,
            notes: { orderBy: { createdAt: 'desc' } },
            reviews: { orderBy: { createdAt: 'desc' } },
            uxAudits: { orderBy: { createdAt: 'desc' } },
            competitorBenchmarks: { orderBy: { createdAt: 'desc' } },
            opsRecommendations: { orderBy: { createdAt: 'desc' } }
        }
    });
}

export async function updateOpportunityStatus(id: string, status: string) {
    return prisma.place.update({
        where: { id },
        data: { status }
    });
}

export async function addNote(id: string, content: string) {
    return prisma.note.create({
        data: {
            placeId: id,
            content
        }
    });
}

export async function exportOpportunitiesAsCsv(filters: OpportunityFilter) {
    const where = buildWhere(filters);
    const leads = await prisma.place.findMany({
        where,
        include: {
            opportunities: { orderBy: { computedAt: 'desc' }, take: 1 },
            llmVerdicts: { orderBy: { createdAt: 'desc' }, take: 1 },
            websiteCheck: true
        },
        take: 5000,
        orderBy: { createdAt: 'desc' }
    });

    if (!leads.length) return null;

    // Header
    const header = ['Name', 'Address', 'Phone', 'Rating', 'Reviews', 'Website', 'Tier', 'Score', 'Value', 'Freshness', 'Type', 'Status', 'Angle', 'Reasons'];
    const rows = leads.map(l => {
        const opp = l.opportunities[0];
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
            opp?.tier || '',
            opp?.score?.toString() || '',
            opp?.value || '',
            opp?.freshness || '',
            opp?.type || '',
            l.status || 'NEW',
            verdict?.offerAngle || '',
            reasons.join('; ')
        ].map(cell => `"${(cell || '').replace(/"/g, '""')}"`).join(','); // Escape CSV
    });

    return [header.join(','), ...rows].join('\n');
}
