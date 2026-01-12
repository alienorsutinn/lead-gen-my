import { PrismaClient } from '@lead-gen-my/db';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
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
    private timeoutMs = 15000;
    private userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

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
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.9',
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache'
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

            if (!response.ok || response.status === 405 || response.status === 403 || response.status === 400) {
                try {
                    const getResponse = await this.performFetch(normalizedUrl, 'GET');
                    response = getResponse;
                } catch (getError) {
                    // Ignore GET fail, use HEAD result (or error state implicit)
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
            // Fallback: Try curl
            try {
                // -I = Head, -L = Follow redirects, -m 15 = 15s timeout, -k = insecure
                const curlCmd = `curl -I -L -k -m 15 --user-agent "${this.userAgent}" "${normalizedUrl}"`;
                const { stdout } = await execAsync(curlCmd);

                // Extract status codes from output (can be multiple if redirects)
                const matches = stdout.matchAll(/HTTP\/\d(?:\.\d)?\s+(\d+)/g);
                let lastStatus = 0;
                for (const m of matches) {
                    lastStatus = parseInt(m[1], 10);
                }

                if (lastStatus > 0) {
                    result.httpStatus = lastStatus;
                    result.status = (lastStatus >= 200 && lastStatus < 400) ? 'ok' : 'broken';
                    if (result.status === 'ok') {
                        result.errors = null;
                        // Basic HTTPS check from curl output (heuristic)
                        if (stdout.includes('Location: https://') || normalizedUrl.startsWith('https://')) {
                            result.https = true;
                        }
                    } else {
                        result.errors = `HTTP ${lastStatus} (curl fallback)`;
                    }
                } else {
                    result.status = 'broken';
                    result.errors = `Fetch: ${error.message} | Curl: No status found`;
                }
            } catch (curlErr: any) {
                result.status = 'broken';
                result.errors = `Fetch: ${error.message} | Curl: ${curlErr.message}`;
            }
        }

        // Extract Socials if OK
        let socials: any = {};
        if (result.status === 'ok') {
            try {
                // Fetch body for social extraction
                const controller = new AbortController();
                const timeout = setTimeout(() => controller.abort(), 8000);
                const resp = await fetch(result.resolvedUrl || result.url, {
                    signal: controller.signal,
                    headers: { 'User-Agent': this.userAgent }
                });
                clearTimeout(timeout);
                const text = await resp.text();
                socials = this.extractSocials(text);
                if (Object.keys(socials).length > 0) {
                    console.log(`[WebsiteChecker] Found socials for ${placeId}:`, socials);
                }
            } catch (e) {
                // Ignore extraction errors
            }
        }

        // Upsert to DB
        try {
            await this.saveResult(placeId, result, socials);
        } catch (dbErr: any) {
            console.warn(`[WebsiteChecker] DB save skipped/failed for ${placeId}: ${dbErr.message}`);
        }

        return result;
    }

    private extractSocials(html: string) {
        const socials: any = {};
        const patterns = {
            facebook: /facebook\.com\/[a-zA-Z0-9\._-]+/i,
            instagram: /instagram\.com\/[a-zA-Z0-9\._-]+/i,
            linkedin: /linkedin\.com\/(?:in|company)\/[a-zA-Z0-9\._-]+/i,
            tiktok: /tiktok\.com\/@[a-zA-Z0-9\._-]+/i,
            twitter: /(?:twitter\.com|x\.com)\/[a-zA-Z0-9\._-]+/i
        };

        for (const [key, regex] of Object.entries(patterns)) {
            const match = html.match(regex);
            if (match) {
                let url = match[0];
                if (!url.startsWith('http')) {
                    url = 'https://www.' + url;
                }
                socials[key] = url;
            }
        }
        return socials;
    }

    private async saveResult(placeId: string, result: WebsiteCheckResult, socials: any = {}) {
        if (placeId.startsWith('test-')) return;

        // Update Place socials if found
        if (Object.keys(socials).length > 0) {
            await prisma.place.update({
                where: { id: placeId },
                data: { socials: JSON.stringify(socials) }
            });
        }

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
