import { describe, it, expect } from 'vitest';
import { WebsiteChecker } from '../src/websites/websiteChecker';

describe('WebsiteChecker', () => {
    it('should correctly identify a working website (Premier Clinic)', async () => {
        const checker = new WebsiteChecker();
        // This URL was reported as broken by the user but is working manually
        const url = 'https://premier-clinic.com/?utm_source=gmb&utm_medium=organic&utm_campaign=website&utm_content=bangsar';

        const result = await checker.check('test-id', url);

        console.log('Check Result:', result);
        expect(result.status).toBe('ok');
        expect(result.httpStatus).toBe(200);
    }, 20000);

    it('should handle redirects correctly', async () => {
        const checker = new WebsiteChecker();
        const url = 'http://google.com'; // Should redirect to https://www.google.com

        const result = await checker.check('test-id-2', url);
        expect(result.status).toBe('ok');
        expect(result.resolvedUrl).toContain('https://');
    });

    it('should identify broken websites (invalid domain)', async () => {
        const checker = new WebsiteChecker();
        const url = 'https://this-domain-definitely-does-not-exist-12345.com';

        const result = await checker.check('test-id-3', url);
        expect(result.status).toBe('broken');
    });
});
