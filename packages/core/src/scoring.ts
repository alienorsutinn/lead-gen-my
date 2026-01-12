export interface ScoreInput {
    rating?: number | null;
    userRatingCount?: number | null;
    websiteUrl?: string | null;
    websiteCheck?: {
        status: string; // "ok", "broken", "no_website"
        https: boolean;
    } | null;
    psi?: {
        seo?: number | null;
        performance?: number | null;
    } | null;
    llmVerdict?: {
        needsIntervention: boolean;
    } | null;
}

export interface ScoreResult {
    score: number;
    tier: 'A' | 'B' | 'C';
    breakdown: Record<string, number>;
}

export const calculateLeadScore = (input: ScoreInput): ScoreResult => {
    let score = 0;
    const breakdown: Record<string, number> = {};

    // --- Business Strength ---

    // Rating Strength
    if ((input.rating || 0) >= 4.3) {
        score += 10;
        breakdown['high_rating'] = 10;
    }

    // Review Volume Strength (Social Proof)
    if ((input.userRatingCount || 0) >= 100) {
        score += 10;
        breakdown['high_review_volume'] = 10;
    }

    // --- Digital Weakness (Opportunity) ---

    // Website Availability
    if (!input.websiteUrl || input.websiteCheck?.status === 'no_website') {
        score += 50;
        breakdown['no_website'] = 50;
    } else if (input.websiteCheck?.status === 'broken') {
        score += 40;
        breakdown['broken_website'] = 40;
    } else {
        // Only check detailed metrics if website exists and works

        // PSI SEO
        if (input.psi?.seo !== null && input.psi?.seo !== undefined && input.psi.seo < 70) {
            score += 10;
            breakdown['low_seo'] = 10;
        }

        // PSI Performance
        if (input.psi?.performance !== null && input.psi?.performance !== undefined && input.psi.performance < 40) {
            score += 10;
            breakdown['low_performance'] = 10;
        }

        // HTTPS
        if (input.websiteCheck && !input.websiteCheck.https) {
            score += 5;
            breakdown['no_https'] = 5;
        }

        // LLM Verdict
        // Heavily weighted as this is the "intelligence" layer saying "YES, sell to them"
        if (input.llmVerdict?.needsIntervention) {
            score += 30;
            breakdown['llm_flagged'] = 30;
        }
    }

    // Clamp
    score = Math.min(100, Math.max(0, score));

    // Tier
    let tier: 'A' | 'B' | 'C' = 'C';
    if (score >= 70) tier = 'A';
    else if (score >= 50) tier = 'B';

    return {
        score,
        tier,
        breakdown
    };
};
