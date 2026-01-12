import { prisma } from '@lead-gen-my/db';

export type OfferType = 'GBP_CONVERSION' | 'LEAD_CAPTURE' | 'SCALE';

export interface LeadOpsScore {
    visibility: number; // 0-100
    conversion: number; // 0-100
    operations: number; // 0-100
    offer: OfferType;
    reasons: string[];
    actions: string[];
}

export class ScoringService {

    async computeScore(placeId: string): Promise<LeadOpsScore | null> {
        const place = await prisma.place.findUnique({
            where: { placeId },
            include: {
                uxAudits: { orderBy: { createdAt: 'desc' }, take: 1 },
                competitorBenchmarks: { orderBy: { createdAt: 'desc' }, take: 1 },
                psiAudits: { orderBy: { fetchedAt: 'desc' }, take: 1 },
                websiteCheck: true
            }
        });

        if (!place) return null;

        const ux = place.uxAudits[0];
        const bench = place.competitorBenchmarks[0];
        const psi = place.psiAudits[0];
        const web = place.websiteCheck;

        // --- 1. Visibility Score (GBP health) ---
        let visibility = 50; // Base

        // Rating impact
        if (place.rating) {
            if (place.rating >= 4.8) visibility += 20;
            else if (place.rating >= 4.5) visibility += 10;
            else if (place.rating < 4.0) visibility -= 10;
        }

        // Percentiles (from benchmark)
        let benchStats: any = {};
        if (bench?.stats) {
            try { benchStats = JSON.parse(bench.stats); } catch (e) { }
        }

        if (benchStats.ratingPercentile) {
            if (benchStats.ratingPercentile <= 20) visibility += 10;
            if (benchStats.ratingPercentile > 50) visibility -= 10;
        }
        visibility = Math.min(100, Math.max(0, visibility));


        // --- 2. Conversion Score (Website/UX) ---
        let conversion = 50;
        let contactMethods: string[] = [];
        if (ux?.contactMethods) {
            try { contactMethods = JSON.parse(ux.contactMethods); } catch (e) { }
        }

        // TTC
        if (ux && ux.ttcAboveFoldMs !== null) {
            if (ux.ttcAboveFoldMs < 2000 && ux.ttcAboveFoldMs > 0) conversion += 15; // Fast
            else if (ux.ttcAboveFoldMs > 5000) conversion -= 10; // Slow/Not vis
        }

        // Clicks
        if (ux && ux.clicksToContact !== null) {
            if (ux.clicksToContact === 0) conversion += 15;
            if (ux.clicksToContact >= 2) conversion -= 15;
        }

        // Methods
        if (contactMethods.includes('form') || contactMethods.includes('booking')) conversion += 10;

        // PSI Penalty
        if (psi && psi.performance) {
            if (psi.performance < 50) conversion -= 10;
            if (psi.performance > 90) conversion += 10;
        }

        conversion = Math.min(100, Math.max(0, conversion));


        // --- 3. Ops Score (Capture/Efficiency) ---
        let ops = 50;

        const hasWa = contactMethods.includes('whatsapp');
        const hasBooking = contactMethods.includes('booking');

        if (hasWa) ops += 20;
        if (hasBooking) ops += 20;
        if (!hasWa && !hasBooking) ops -= 20;

        ops = Math.min(100, Math.max(0, ops));


        // --- Offer Routing ---
        let offer: OfferType = 'SCALE';
        const reasons: string[] = [];
        const actions: string[] = [];

        // Logic:
        // 1. If critical visibility issues -> GBP Pack
        if (visibility < 60 || (place.userRatingCount || 0) < 5) {
            offer = 'GBP_CONVERSION';
            reasons.push('Low review volume or rating limits trust.');
            reasons.push('Competitors are outranking you locally.');
            actions.push('Review generation campaign.');
            actions.push('GBP optimization & citation cleanup.');
        }
        // 2. If visibility OK but conversion/ops poor -> Lead Capture Pack
        else if (conversion < 60 || ops < 60) {
            offer = 'LEAD_CAPTURE';
            reasons.push('High friction for customers to contact you.');
            reasons.push('Missing instant capture channels (WhatsApp/Booking).');
            if (ux?.clicksToContact && ux.clicksToContact > 1) reasons.push('Contact info is buried (2+ clicks).');

            actions.push('Deploy high-conversion microsite.');
            actions.push('Install WhatsApp & Booking widgets.');
        }
        // 3. If all good -> Scale Pack
        else {
            offer = 'SCALE';
            reasons.push('Strong foundation detected.');
            reasons.push('Ready for paid traffic expansion.');
            actions.push('Dedicated service-area landing pages.');
            actions.push('PPC/Ads management with tracking.');
        }

        // --- Calculate Opportunity Fields ---
        // Score: Simple average for now
        const score = Math.round((visibility + conversion + ops) / 3);

        // Tier
        let tier = 'C';
        if (score > 75) tier = 'A';
        else if (score > 50) tier = 'B';

        // Type
        let type = 'seo_opportunity'; // Default
        if (!place.websiteUrl) type = 'no_website';
        else if (web?.status === 'broken') type = 'broken_website';
        else if (psi?.performance && psi.performance < 50) type = 'poor_mobile';
        else if (conversion < 50) type = 'poor_mobile'; // Fallback

        // Value
        let value = 'RM 500 - 1000';
        if (tier === 'A') value = 'RM 3000 - 5000';
        else if (tier === 'B') value = 'RM 1000 - 3000';

        // Freshness
        const freshness = 'new'; // Simplification for MVP

        // Save Opportunity
        await prisma.opportunity.create({
            data: {
                placeId: place.id,
                score,
                tier,
                type,
                value,
                freshness,
                breakdown: JSON.stringify({ visibility, conversion, ops })
            }
        });

        // Save OpsRecommendation (renamed from LeadOpsRecommendation)
        await prisma.opsRecommendation.create({
            data: {
                placeId: place.id,
                visibilityScore: visibility,
                conversionScore: conversion,
                opsScore: ops,
                offerType: offer,
                reasons: JSON.stringify(reasons),
                actions: JSON.stringify(actions)
            }
        });

        return {
            visibility, conversion, operations: ops, offer, reasons, actions
        };
    }
}
