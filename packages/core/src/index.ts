export enum LeadStatus {
    NEW = 'NEW',
    PROCESSED = 'PROCESSED',
    QUALIFIED = 'QUALIFIED',
    DISQUALIFIED = 'DISQUALIFIED'
}

export enum JobType {
    SCAN_PLACE = 'SCAN_PLACE', // Legacy
    AUDIT_WEBSITE = 'AUDIT_WEBSITE', // Legacy
    DISCOVER = 'DISCOVER',
    WEBSITE_CHECK = 'WEBSITE_CHECK',
    PSI_AUDIT = 'PSI_AUDIT',
    SCREENSHOT = 'SCREENSHOT',
    LLM_VERDICT = 'LLM_VERDICT',
    SCORE = 'SCORE'
}

export interface WebsiteAuditResult {
    score: number;
    mobileFriendly: boolean;
    loadTimeMs: number;
    hasSsl: boolean;
    socialLinks: string[];
}

// export const calculateScore = (audit: WebsiteAuditResult): number => { ... } // Legacy
export * from './scoring';

