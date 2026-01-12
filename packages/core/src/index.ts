export enum LeadStatus {
    NEW = 'NEW',
    PROCESSED = 'PROCESSED',
    QUALIFIED = 'QUALIFIED',
    DISQUALIFIED = 'DISQUALIFIED'
}

export enum JobType {
    SCAN_PLACE = 'SCAN_PLACE',
    AUDIT_WEBSITE = 'AUDIT_WEBSITE'
}

export interface WebsiteAuditResult {
    score: number;
    mobileFriendly: boolean;
    loadTimeMs: number;
    hasSsl: boolean;
    socialLinks: string[];
}

export const calculateScore = (audit: WebsiteAuditResult): number => {
    let score = 0;
    if (audit.score > 80) score += 40;
    if (audit.mobileFriendly) score += 30;
    if (audit.hasSsl) score += 10;
    if (audit.loadTimeMs < 2000) score += 20;
    return score;
};
