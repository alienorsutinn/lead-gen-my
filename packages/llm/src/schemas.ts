import { z } from 'zod';

export const VerdictSchema = z.object({
    needs_intervention: z.boolean(),
    severity: z.enum(['low', 'medium', 'high']),
    reasons: z.array(z.string()).max(6),
    quick_wins: z.array(z.string()).max(6),
    offer_angle: z.enum([
        'website_redesign',
        'landing_page',
        'booking_whatsapp',
        'seo_basics',
        'unknown'
    ])
});

export type Verdict = z.infer<typeof VerdictSchema>;
