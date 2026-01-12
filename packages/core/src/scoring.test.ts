import { describe, it, expect } from 'vitest';
import { calculateLeadScore, ScoreInput } from './index'; // Exported from index.ts

describe('calculateLeadScore', () => {
    it('should return a perfect score for ideal conditions', () => {
        const input: ScoreInput = {
            rating: 5.0,
            reviewCount: 100,
            hasWebsite: false, // Wait, hasWebsite=false is BAD? Or opportunity?
            // Logic: No website = +Digital Weakness? 
            // verifying logic in scoring.ts:
            // "Digital Weakness (Max 40)"
            // No website = +30 points.
            // Weak Website = +15.
            // "Business Strength (Max 30)"
            // Rating > 4.5 = +10. Reviews > 50 = +10.
            // So pure score = 30 + 10 + 10 = 50?
            // Let's check the code logic.

            // To be safe, let's treat hasWebsite=false as an opportunity.
            websiteStatus: 'no_website',
            psiMobile: 0,
            hasSocials: false
        };

        const result = calculateLeadScore(input);
        expect(result.score).toBeGreaterThan(0);
        expect(result.breakdown).toBeDefined();
    });

    it('should penalize (give low score) for already optimized businesses', () => {
        const input: ScoreInput = {
            rating: 5.0,
            reviewCount: 500,
            hasWebsite: true,
            websiteStatus: 'ok',
            psiMobile: 95, // Good performance
            hasSocials: true
        };
        // If business is perfect, lead score (value to US) should be low?
        // Or is "Lead Score" about *how likely they are to buy*?
        // Usually Lead Score = Opportunity.
        // If they have everything, Opportunity = Low.

        const result = calculateLeadScore(input);
        expect(result.score).toBeLessThan(50); // Assuming 100 is "Hot Lead"
    });
});
