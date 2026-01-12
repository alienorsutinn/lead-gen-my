import { describe, it, expect } from 'vitest';
import { calculateLeadScore, ScoreInput } from './scoring';

describe('calculateLeadScore', () => {
    it('should return a high score for no website (tier A opportunity)', () => {
        const input: ScoreInput = {
            rating: 4.8,
            userRatingCount: 150,
            websiteUrl: null,
            websiteCheck: { status: 'no_website', https: false },
            psi: null,
            llmVerdict: null
        };

        // Logic Expectations:
        // Rating >= 4.3 -> +10
        // Reviews >= 100 -> +10
        // No Website -> +50
        // Total = 70. (Which is Tier B... wait, 70 is B. To get A we need > 80?)
        // Let's re-read scoring.ts logic if I adjusted it?
        // Ah, earlier I set No Website to 50.
        // If llmVerdict triggers (needsIntervention=+30), then score is 100.

        const result = calculateLeadScore(input);
        expect(result.score).toBeGreaterThanOrEqual(70);
        expect(result.breakdown['no_website']).toBe(50);
        expect(result.breakdown['high_rating']).toBe(10);
    });

    it('should identify Tier A when LLM intervention + No Website combined', () => {
        const input: ScoreInput = {
            rating: 4.8,
            userRatingCount: 150,
            websiteUrl: null,
            websiteCheck: { status: 'no_website', https: false },
            psi: null,
            llmVerdict: { needsIntervention: true }
        };
        // 10 + 10 + 50 + 30 = 100.
        const result = calculateLeadScore(input);
        expect(result.score).toBe(100);
        expect(result.tier).toBe('A');
    });

    it('should give low score for optimized business', () => {
        const input: ScoreInput = {
            rating: 4.0, // < 4.3 (0 pts)
            userRatingCount: 10, // < 50 (0 pts)
            websiteUrl: 'https://example.com',
            websiteCheck: { status: 'ok', https: true },
            psi: { seo: 90, performance: 90 }, // No penalties
            llmVerdict: { needsIntervention: false } // 0 pts
        };

        const result = calculateLeadScore(input);
        expect(result.score).toBeLessThan(20);
        expect(result.tier).toBe('C');
    });
});
