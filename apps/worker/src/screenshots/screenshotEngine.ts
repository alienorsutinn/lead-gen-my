import { chromium, Browser, BrowserContext, Page } from 'playwright';

const FAST_MODE = process.env.SCREENSHOT_FAST_MODE === 'true';

export interface ScreenshotOptions {
    viewport: 'mobile' | 'desktop';
}

export class ScreenshotEngine {
    private browser: Browser | null = null;

    async init() {
        if (!this.browser) {
            this.browser = await chromium.launch({
                headless: true, // Always headless for worker
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
        }
    }

    async close() {
        if (this.browser) {
            await this.browser.close();
            this.browser = null;
        }
    }

    async capture(url: string, options: ScreenshotOptions): Promise<{ buffer: Buffer; finalUrl: string }> {
        if (!this.browser) await this.init();

        const context = await this.browser!.newContext({
            viewport: options.viewport === 'mobile'
                ? { width: 390, height: 844 }
                : { width: 1366, height: 768 },
            userAgent: options.viewport === 'mobile'
                ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
                : 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        });

        const page = await context.newPage();

        try {
            if (FAST_MODE) {
                await page.route('**/*', (route) => {
                    const reqType = route.request().resourceType();
                    if (['image', 'media', 'font'].includes(reqType)) {
                        route.abort();
                    } else {
                        route.continue();
                    }
                });
            }

            await page.goto(url, {
                waitUntil: 'domcontentloaded',
                timeout: 30000
            });

            // Brief wait for any JS renders
            await page.waitForTimeout(1000);

            const buffer = await page.screenshot({
                fullPage: false, // Requirements detailed viewport size, implied "above fold" or specific size? Defaults to viewport.
                type: 'png'
            });

            const finalUrl = page.url();

            return { buffer, finalUrl };

        } finally {
            await context.close();
        }
    }
}
