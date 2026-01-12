import { PrismaClient } from '@lead-gen-my/db';

const prisma = new PrismaClient();

interface WebsiteCheckResult {
    status: 'ok' | 'broken' | 'no_website';
    url: string;
    resolvedUrl: string | null;
    httpStatus: number | null;
    https: boolean;
    errors: string | null;
}

export class WebsiteChecker {
    private timeoutMs = 10000;
    // Generic user agent to avoid basic blocking
    private userAgent = 'Mozilla/5.0 (compatible; LeadGenBot/1.0; +http://example.com/bot)';

    private normalizeUrl(url: string): string {
        if (!url) return '';
        let normalized = url.trim();
        if (!normalized.match(/^https?:\/\//i)) {
            normalized = 'https://' + normalized;
        }
        return normalized;
    }

    private async performFetch(url: string, method: 'HEAD' | 'GET'): Promise<Response> {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    'User-Agent': this.userAgent,
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
                },
                redirect: 'follow',
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            return response;
        } catch (error) {
            clearTimeout(timeoutId);
            throw error;
        }
    }

    async check(placeId: string, url: string): Promise<WebsiteCheckResult> {
        if (!url) {
            return {
                status: 'no_website',
                url: '',
                resolvedUrl: null,
                httpStatus: null,
                https: false,
                errors: 'Empty URL provided'
            };
        }

        const normalizedUrl = this.normalizeUrl(url);
        let result: WebsiteCheckResult = {
            status: 'broken',
            url: normalizedUrl,
            resolvedUrl: null,
            httpStatus: null,
            https: false,
            errors: null
        };

        try {
            // First try HEAD
            let response = await this.performFetch(normalizedUrl, 'HEAD');

            // If HEAD fails with 404 or 405 (Method Not Allowed), try GET
            if (response.status === 405 || response.status === 404 || response.status === 400 || response.status === 403) {
                // Some servers return 400/403 on HEAD but work on GET
                try {
                    const getResponse = await this.performFetch(normalizedUrl, 'GET');
                    // If GET is successful (or better than the HEAD error), use it
                    if (getResponse.ok || getResponse.status < 400) {
                        response = getResponse;
                    }
                    // Even if GET fails, we might get a more accurate status code/url
                    else {
                        response = getResponse;
                    }
                } catch (getError) {
                    // If GET fails network-wise, we might stick with the HEAD result or error
                    // But typically if HEAD connected, GET should too. 
                    // Let's just update `response` if the GET was successful to capture redirects properly
                }
            }

            result.resolvedUrl = response.url;
            result.httpStatus = response.status;
            result.https = response.url.startsWith('https:');

            if (response.ok) {
                result.status = 'ok';
            } else {
                result.status = 'broken';
                result.errors = `HTTP ${response.status} ${response.statusText}`;
            }

        } catch (error: any) {
            result.status = 'broken';
            result.errors = error.message || String(error);
            // Fallback for resolvedUrl if we can't even connect? 
            // Just leave as null or original if we want.
        }

        // Upsert to DB
        try {
            await this.saveResult(placeId, result);
        } catch (dbErr: any) {
            console.error(`Failed to save WebsiteCheck for ${placeId}:`, dbErr);
            // We return the check result even if DB save fails, though caller might want to know
        }

        return result;
    }

    private async saveResult(placeId: string, result: WebsiteCheckResult) {
        await prisma.websiteCheck.upsert({
            where: { placeId },
            create: {
                placeId,
                url: result.url,
                resolvedUrl: result.resolvedUrl,
                status: result.status,
                https: result.https,
                httpStatus: result.httpStatus,
                errors: result.errors,
                lastCheckedAt: new Date()
            },
            update: {
                url: result.url,
                resolvedUrl: result.resolvedUrl,
                status: result.status,
                https: result.https,
                httpStatus: result.httpStatus,
                errors: result.errors,
                lastCheckedAt: new Date()
            }
        });
    }
}
