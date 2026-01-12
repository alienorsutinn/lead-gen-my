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

    // Review Volume Strength
    if ((input.userRatingCount || 0) >= 200) {
        score += 20;
        breakdown['high_review_volume'] = 20;
    } else if ((input.userRatingCount || 0) >= 50) {
        score += 10;
        breakdown['medium_review_volume'] = 10;
    }

    // --- Digital Weakness (Opportunity) ---

    // Website Availability
    if (!input.websiteUrl || input.websiteCheck?.status === 'no_website') {
        score += 35;
        breakdown['no_website'] = 35;
    } else if (input.websiteCheck?.status === 'broken') {
        score += 25;
        breakdown['broken_website'] = 25;
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
        if (input.llmVerdict?.needsIntervention) {
            score += 15;
            breakdown['llm_flagged'] = 15;
        }
    }

    // Clamp
    score = Math.min(100, Math.max(0, score));

    // Tier
    let tier: 'A' | 'B' | 'C' = 'C';
    if (score >= 80) tier = 'A';
    else if (score >= 60) tier = 'B';

    return {
        score,
        tier,
        breakdown
    };
};
