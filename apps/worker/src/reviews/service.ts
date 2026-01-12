import { PrismaClient } from '@lead-gen-my/db';
import { chromium, Browser, Page } from 'playwright';

const prisma = new PrismaClient();

interface ScrapedReview {
    authorName: string;
    rating: number;
    text: string;
    publishTime: string;
    images: string[];
}

export class ReviewService {
    private browser: Browser | null = null;

    async fetchReviews(internalOrPlaceId: string, url: string, targetCount = 100) {
        // Resolve the actual Google Place ID (ChIJ...) if we were passed an internal ID
        let googlePlaceId = internalOrPlaceId;
        let internalId = internalOrPlaceId;
        let placeName = "Google Maps";

        if (!googlePlaceId.startsWith('ChIJ')) {
            const place = await prisma.place.findUnique({ where: { id: internalOrPlaceId } });
            if (place) {
                googlePlaceId = place.placeId;
                placeName = place.name;
            }
        } else {
            const place = await prisma.place.findUnique({ where: { placeId: googlePlaceId } });
            if (place) {
                internalId = place.id;
                placeName = place.name;
            }
        }

        // If after resolution, googlePlaceId is still not a ChIJ ID, or is null, we can't proceed.
        // This might happen if internalOrPlaceId was an internal ID but no matching place was found.
        if (!googlePlaceId || !googlePlaceId.startsWith('ChIJ')) {
            console.log(`Skipping reviews for ${internalOrPlaceId}: Could not resolve a valid Google Place ID.`);
            return;
        }

        // Use the official Google Maps search URL which is robust for Place IDs
        const cleanUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(placeName)}&query_place_id=${googlePlaceId}&hl=en`;

        console.log(`Fetching up to ${targetCount} reviews for ${placeName} (${googlePlaceId}) from ${cleanUrl}`);

        let reviews: ScrapedReview[] = [];

        try {
            this.browser = await chromium.launch({
                headless: true,
                args: ['--disable-blink-features=AutomationControlled']
            });
            const page = await this.browser.newPage({
                locale: 'en-US',
                viewport: { width: 1920, height: 1080 },
                userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            });
            page.setDefaultTimeout(60000);

            console.log(`[DEBUG] Navigating to ${cleanUrl}...`);
            await page.goto(cleanUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });

            // Wait for the side panel to appear (indicated by the presence of buttons or specific containers)
            console.log(`[DEBUG] Page loaded. Waiting for sidebar...`);
            await page.waitForSelector('button', { timeout: 15000 }).catch(() => { });

            // Handle Consent Screen if it appears
            const consentButton = page.getByRole('button', { name: /Accept all/i }).or(page.getByRole('button', { name: /Agree/i }));
            if (await consentButton.count() > 0) {
                console.log("[DEBUG] Handling consent screen...");
                await consentButton.first().click();
                await page.waitForTimeout(3000);
            }

            // 1. Click "Reviews" tab
            // Search for a tab or button that says "Reviews"
            const reviewsTab = page.locator('button[role="tab"]').filter({ hasText: /Reviews/i })
                .or(page.locator('button').filter({ hasText: /Reviews/i }))
                .or(page.locator('div[role="tab"]').filter({ hasText: /Reviews/i }))
                .or(page.locator('button[aria-label*="Reviews"]'));

            // If the tab is not immediately visible, it might be in a sidebar that hasn't fully expanded.
            try {
                await reviewsTab.first().waitFor({ state: 'visible', timeout: 10000 });
            } catch (e) {
                console.log("[DEBUG] Reviews tab not visible after 10s. Trying to find any reviews count text to click...");
                const reviewCountLink = page.locator('button[aria-label*="reviews"]').first();
                if (await reviewCountLink.count() > 0) {
                    await reviewCountLink.click();
                    await page.waitForTimeout(3000);
                }
            }

            if (await reviewsTab.count() > 0) {
                console.log(`[DEBUG] Clicking Reviews tab...`);
                await reviewsTab.first().click();
                await page.waitForTimeout(3000);
            }

            // 2. Sort by "Newest"
            const sortButton = page.getByRole('button', { name: /Sort/i }).or(page.locator('button[aria-label*="Sort"]'));
            if (await sortButton.count() > 0) {
                await sortButton.first().click();
                await page.waitForTimeout(2000);
                const newestOption = page.locator('div[role="menuitemradio"]').filter({ hasText: /Newest/i })
                    .or(page.getByRole('menuitemradio', { name: /Newest/i }))
                    .or(page.locator('text=Newest'));
                if (await newestOption.count() > 0) {
                    await newestOption.first().click();
                    console.log("Sorted by Newest");
                    await page.waitForTimeout(3000);
                }
            }

            // 3. Scroll to load reviews
            let lastCount = 0;
            let noChangeCount = 0;
            const maxScrolls = 40;

            for (let i = 0; i < maxScrolls; i++) {
                // Selector for the scrollable container
                const feed = page.locator('div[role="main"] div[role="feed"]')
                    .or(page.locator('div.m6QErb.DxyBCb'))
                    .or(page.locator('div[scrollable="true"]'));

                // Selector for items
                const currentCount = await page.locator('div[data-review-id]').or(page.locator('div.jftiEf')).count();
                console.log(`Scroll ${i + 1}: Loaded ~${currentCount} reviews`);

                if (await feed.count() > 0) {
                    await feed.first().evaluate(el => el.scrollTo(0, el.scrollHeight));
                } else {
                    await page.mouse.wheel(0, 5000);
                }

                await page.waitForTimeout(1500 + Math.random() * 1000);

                if (currentCount >= targetCount) break;
                if (currentCount > 0 && currentCount === lastCount) {
                    noChangeCount++;
                    if (noChangeCount > 3) break;
                } else if (currentCount > 0) {
                    noChangeCount = 0;
                }
                lastCount = currentCount;
            }

            // 4. Click "More" buttons to expand review text
            const moreButtons = page.locator('button:has-text("More")');
            const buttonCount = await moreButtons.count();
            for (let i = 0; i < Math.min(buttonCount, 100); i++) {
                try {
                    await moreButtons.nth(i).click({ timeout: 1000 }).catch(() => { });
                } catch (e) { }
            }

            // 5. Extract Reviews
            reviews = await page.evaluate(() => {
                const results: any[] = [];
                const blocks = document.querySelectorAll('div[data-review-id]');

                blocks.forEach(block => {
                    // Author
                    const authorEl = block.querySelector('.d4r55'); // Specific class often used for author
                    const authorName = authorEl?.textContent?.trim() || block.getAttribute('aria-label') || "Anonymous";

                    // Rating
                    const starsEl = block.querySelector('[role="img"][aria-label*="stars"]');
                    let rating = 0;
                    if (starsEl) {
                        const aria = starsEl.getAttribute('aria-label') || "";
                        const match = aria.match(/(\d)(\.|,)?\d?/);
                        if (match) rating = parseFloat(match[0]);
                    }

                    // Text
                    const textSpan = block.querySelector('span.wiTb6, span[dir="ltr"]');
                    const text = textSpan?.textContent?.trim() || "";

                    // Time
                    const timeEl = block.querySelector('.rsqa6'); // Often used for relative time
                    const publishTime = timeEl?.textContent?.trim() || "";

                    // Images
                    // Maps uses buttons with background-image OR actual img tags in some views
                    const images: string[] = [];
                    const imageButtons = block.querySelectorAll('button[style*="background-image"]');
                    imageButtons.forEach(el => {
                        const style = el.getAttribute('style') || "";
                        const match = style.match(/url\("?(.+?)"?\)/);
                        if (match) images.push(match[1]);
                    });

                    const imgTags = block.querySelectorAll('img');
                    imgTags.forEach(img => {
                        const src = img.getAttribute('src');
                        if (src && src.startsWith('http') && !src.includes('profile_photos')) {
                            images.push(src);
                        }
                    });

                    if (authorName) {
                        results.push({
                            authorName,
                            rating,
                            text,
                            publishTime,
                            images: Array.from(new Set(images)) // Deduplicate
                        });
                    }
                });

                return results;
            });

            console.log(`Extracted ${reviews.length} reviews.`);

        } catch (e: any) {
            console.error(`Error scraping reviews for ${googlePlaceId}: `, e.message);
        } finally {
            if (this.browser) await this.browser.close();
        }

        // Save to DB (replace all)
        if (reviews.length > 0) {
            await prisma.review.deleteMany({ where: { placeId: internalId } });

            console.log(`Saving ${Math.min(reviews.length, targetCount)} reviews...`);
            for (const review of reviews.slice(0, targetCount)) {
                if (!review.authorName) continue;

                await prisma.review.create({
                    data: {
                        placeId: internalId,
                        authorName: review.authorName,
                        rating: review.rating || 0,
                        text: review.text || "",
                        publishTime: review.publishTime || "",
                        sentiment: (review.rating >= 4) ? 'positive' : (review.rating <= 2) ? 'negative' : 'neutral',
                        images: review.images.length > 0 ? JSON.stringify(review.images) : null
                    }
                });
            }
        }
        console.log(`Review sync complete for ${googlePlaceId}.`);
    }
}
