import { chromium, Browser, Page } from 'playwright';
import { existsSync, mkdirSync } from 'fs';
import path from 'path';

export interface UxAuditResult {
    finalUrl: string;
    viewport: 'mobile' | 'desktop';
    ttcAboveFoldMs: number; // Time until a contact button is visible (0 if immediate)
    clicksToContact: number; // 0 if visible, 1 if in menu, 2 if buried
    contactMethods: string[]; // ['tel:+123', 'wa.me/xyz', 'mailto:abc']
    blockers: string[]; // ['cookie_overlay', 'slow_load']
    evidencePngPath: string | null;
}

export class UxAuditEngine {
    private browser: Browser | null = null;

    async init() {
        this.browser = await chromium.launch({ headless: true });
    }

    async close() {
        if (this.browser) await this.browser.close();
    }

    async auditUrl(url: string, placeId: string, outputDir: string): Promise<UxAuditResult> {
        if (!this.browser) await this.init();

        // Setup context for mobile
        const context = await this.browser!.newContext({
            viewport: { width: 390, height: 844 }, // iPhone 12/13/14
            userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Mobile/15E148 Safari/604.1',
            deviceScaleFactor: 3,
        });

        const page = await context.newPage();
        const result: UxAuditResult = {
            finalUrl: url,
            viewport: 'mobile',
            ttcAboveFoldMs: -1,
            clicksToContact: -1,
            contactMethods: [],
            blockers: [],
            evidencePngPath: null,
        };

        try {
            const startTime = Date.now();

            // Navigate with timeout
            try {
                await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
                // Wait a bit more for SPA/hydration
                await page.waitForTimeout(2000);
            } catch (e: any) {
                result.blockers.push('timeout_or_error');
                console.error(`[UxAudit] Load error: ${e.message}`);
            }

            result.finalUrl = page.url();

            // 1. Detect Contact Methods (Heuristics)
            // Check hrefs for tel:, mailto:, wa.me, etc.
            const links = await page.$$eval('a', (anchors) =>
                anchors.map(a => ({ href: a.href, text: a.innerText, isVisible: false }))
            );

            // Simple regex checks
            const methods = new Set<string>();
            for (const link of links) {
                const href = link.href.toLowerCase();
                if (href.startsWith('tel:')) methods.add('phone');
                if (href.startsWith('mailto:')) methods.add('email');
                if (href.includes('wa.me') || href.includes('api.whatsapp.com')) methods.add('whatsapp');
                if (href.includes('booking') || href.includes('calendly')) methods.add('booking');
                if (link.text.toLowerCase().includes('contact') || link.text.toLowerCase().includes('get a quote')) {
                    // Just a text signal, might be a page link
                    methods.add('contact_page_link');
                }
            }

            // Check for form
            const hasForm = await page.$('form');
            if (hasForm) methods.add('form');

            result.contactMethods = Array.from(methods);

            // 2. Measure TTC / Visibility (Is a contact CTA above fold?)
            // We'll consider "above fold" as visible within the viewport
            const contactSelectors = [
                'a[href^="tel:"]',
                'a[href^="mailto:"]',
                'a[href*="wa.me"]',
                'a[href*="whatsapp"]',
                'button:has-text("Call")',
                'button:has-text("Email")',
                'button:has-text("Quote")',
                'button:has-text("Contact")',
                '.fab', // Floating action buttons often used
                '[aria-label*="chat"]'
            ];

            // Outline relevant elements for screenshot
            let highlighted = false;
            let visibleContactFound = false;

            // Inject style for highlighting
            await page.addStyleTag({
                content: `
        .audit-highlight { 
            outline: 4px solid #FF00FF !important; 
            box-shadow: 0 0 15px rgba(255, 0, 255, 0.7) !important;
            background-color: rgba(255, 0, 255, 0.1) !important;
            z-index: 999999 !important;
        }
      `});

            for (const selector of contactSelectors) {
                try {
                    const els = await page.$$(selector);
                    for (const el of els) {
                        const isVisible = await el.isVisible();
                        if (isVisible) {
                            const box = await el.boundingBox();
                            if (box && box.y < 844) { // Roughly above fold height
                                visibleContactFound = true;
                                // Determine TTC - approximation: it's visible now (after load + 2s), so we count load time
                                if (result.ttcAboveFoldMs === -1) {
                                    result.ttcAboveFoldMs = Date.now() - startTime;
                                }
                            } else if (isVisible) {
                                // Visible but below fold
                                // We could count this as clicks=0 (scroll) but not "above fold"
                            }

                            // Highlight for screenshot
                            await el.evaluate(node => node.classList.add('audit-highlight'));
                            highlighted = true;
                        }
                    }
                } catch (e) {
                    // ignore selector errors
                }
            }

            if (visibleContactFound) {
                result.clicksToContact = 0;
            } else {
                // If not visible above fold, check if we have a contact link (hamburger menu -> contact?)
                // This allows us to estimate clicks. 
                // 1 click: Visible "Contact" or "Menu" that is likely to have it.
                // For now, heuristic:
                if (methods.has('contact_page_link')) {
                    result.clicksToContact = 1;
                } else {
                    result.clicksToContact = 2; // Assume hard to find
                }
                // Use a default "slow" TTC if not immediately found
                result.ttcAboveFoldMs = 5000;
            }

            // 3. Evidence Screenshot using screenshot-service
            const fileName = `ux_audit_${placeId}_mobile.png`;
            if (!existsSync(outputDir)) {
                mkdirSync(outputDir, { recursive: true });
            }
            const filePath = path.join(outputDir, fileName);

            await page.screenshot({ path: filePath, fullPage: false });
            result.evidencePngPath = filePath;

        } catch (err: any) {
            console.error(`[UxAudit] Fatal error auditing ${url}:`, err);
            result.blockers.push(err.message);
        } finally {
            await context.close();
        }

        return result;
    }
}
