import { prisma } from '@lead-gen-my/db';

export interface CompetitorStats {
    density: number; // Count in radius
    ratingPercentile: number; // 0-100
    reviewCountPercentile: number; // 0-100
    gaps: {
        whatsapp: boolean; // True if competitor has it but we don't
        booking: boolean;
        website: boolean;
    };
}

export class CompetitorService {
    async runBenchmark(placeId: string, radiusKm: number = 2.0) {
        const target = await prisma.place.findUnique({
            where: { placeId },
        });

        if (!target || !target.lat || !target.lng) {
            console.log(`[Benchmark] Skipping ${placeId} - missing location`);
            return;
        }

        // Find nearby places in DB
        // Simple bounding box or Haversine in memory (SQLite/Prisma unsupported spatial)
        const lat = target.lat;
        const lng = target.lng;
        const rDiff = radiusKm / 111; // Approx degrees

        const candidates = await prisma.place.findMany({
            where: {
                lat: { gte: lat - rDiff, lte: lat + rDiff },
                lng: { gte: lng - rDiff, lte: lng + rDiff },
                placeId: { not: target.placeId }, // Exclude self
                primaryType: target.primaryType || undefined, // Match category if possible
            }
        });

        const competitors = candidates
            .map(p => {
                const d = this.getDistanceFromLatLonInKm(lat, lng, p.lat!, p.lng!);
                return { ...p, distance: d };
            })
            .filter(p => p.distance <= radiusKm)
            .sort((a, b) => (b.rating || 0) - (a.rating || 0)) // Sort by rating
            .slice(0, 5); // Top 5

        // Compute Stats
        const totalCompetitors = competitors.length;

        // Percentiles
        const betterRated = competitors.filter(c => (c.rating || 0) > (target.rating || 0)).length;
        const ratingPercentile = totalCompetitors > 0
            ? Math.round(((totalCompetitors - betterRated) / totalCompetitors) * 100)
            : 100;

        const moreReviews = competitors.filter(c => (c.userRatingCount || 0) > (target.userRatingCount || 0)).length;
        const reviewCountPercentile = totalCompetitors > 0
            ? Math.round(((totalCompetitors - moreReviews) / totalCompetitors) * 100)
            : 100;

        // Feature Gaps
        // Currently relying on Place model having simple fields, but we might need to parse `socials` or `websiteCheck` text for deep feature detection.
        // Minimally: check raw fields if present
        const targetSocials = JSON.parse(target.socials || '{}');
        const targetHasWa = !!target.phone || !!targetSocials.whatsapp; // Crude proxy

        let gapWhatsapp = false;
        let gapBooking = false;

        // Check if ANY top competitor has these while we don't
        const competitorsWithWa = competitors.filter(c => {
            const soc = JSON.parse(c.socials || '{}');
            return !!soc.whatsapp;
        }).length;

        if (!targetHasWa && competitorsWithWa > 0) gapWhatsapp = true;

        // Save result
        const stats: CompetitorStats = {
            density: totalCompetitors,
            ratingPercentile,
            reviewCountPercentile,
            gaps: {
                whatsapp: gapWhatsapp,
                booking: gapBooking, // TODO: improve extraction
                website: !target.websiteUrl && competitors.some(c => !!c.websiteUrl)
            }
        };

        // Store in DB
        await prisma.competitorBenchmark.create({
            data: {
                placeId: target.id,
                radiusKm,
                competitors: JSON.stringify(competitors.map(c => ({
                    name: c.name,
                    rating: c.rating,
                    reviews: c.userRatingCount,
                    distance: c.distance
                }))),
                stats: JSON.stringify(stats)
            }
        });

        console.log(`[Benchmark] Completed for ${target.name}. Rank: ${ratingPercentile}%`);
    }

    // Haversine
    private getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
        const R = 6371; // Radius of the earth in km
        const dLat = this.deg2rad(lat2 - lat1);
        const dLon = this.deg2rad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const d = R * c; // Distance in km
        return d;
    }

    private deg2rad(deg: number) {
        return deg * (Math.PI / 180);
    }
}
