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

    async fetchReviews(placeId: string, url: string) {
        if (!url || !url.includes('google.com/maps')) {
            console.log(`Skipping reviews for ${placeId}: Not a Google Maps URL`);
            return;
        }

        console.log(`Fetching reviews for ${placeId} from ${url}`);

        let reviews: ScrapedReview[] = [];

        try {
            this.browser = await chromium.launch({ headless: true }); // Set to false to debug visually if needed
            const page = await this.browser.newPage();

            // Set longer timeout
            page.setDefaultTimeout(60000);

            // Go to Google Maps URL
            await page.goto(url, { waitUntil: 'domcontentloaded' });

            // 1. Click "Reviews" tab
            const reviewsTab = page.getByRole('tab', { name: /Reviews/i });
            if (await reviewsTab.count() > 0) {
                await reviewsTab.first().click();
                await page.waitForTimeout(2000);
            } else {
                console.log("No Reviews tab found, might be directly on reviews or no reviews.");
            }

            // 2. Sort by "Newest"
            // The sort button usually has text "Sort"
            const sortButton = page.getByRole('button', { name: /Sort/i });
            if (await sortButton.isVisible()) {
                await sortButton.click();
                await page.waitForTimeout(1000);

                // Click "Newest" option
                // Often labelled "Newest" or "Most recent"
                const newestOption = page.getByRole('menuitemradio', { name: /Newest/i });
                if (await newestOption.isVisible()) {
                    await newestOption.click();
                    console.log("Sorted by Newest");
                    await page.waitForTimeout(3000); // Wait for list to reload
                }
            }

            // 3. Scroll to load more reviews
            // We need to find the scrollable container. Usually it's the one containing the reviews.
            // A good heuristic is looking for the container with role='feed' or just scrolling the sidebar.
            // On Google Maps, the sidebar is often `div[role="main"]` or similar.
            // Let's try locating the list container.

            const sidebarSelector = 'div[role="main"] div[role="feed"]'; // Common pattern
            // Fallback: just scroll the page if not in a specific container context (though Maps is usually a sidebar)

            // Limit to prevent infinite loops, e.g. 1000 reviews or 50 scrolls
            let previousHeight = 0;
            const maxScrolls = 20;

            for (let i = 0; i < maxScrolls; i++) {
                // Try to scroll the feed container
                const feed = page.locator('div[role="main"] > div[role="feed"]');

                if (await feed.count() > 0) {
                    // Scroll sidebar
                    await feed.evaluate(el => el.scrollTo(0, el.scrollHeight));
                } else {
                    // Fallback window scroll
                    await page.mouse.wheel(0, 5000);
                }

                await page.waitForTimeout(1500 + Math.random() * 1000); // Random delay

                const reviewsCount = await page.locator('div[data-review-id]').count();
                console.log(`Scroll ${i + 1}: Loaded ~${reviewsCount} reviews`);

                // Break if no new reviews loaded? (Simplification for now: just run X scrolls)
            }


            // 4. Extract Reviews
            reviews = await page.evaluate(() => {
                const results: any[] = [];
                // Review blocks usually have `data-review-id` or match generic aria labels
                const blocks = document.querySelectorAll('div[data-review-id]');

                blocks.forEach(block => {
                    // Author
                    const authorEl = block.querySelector('div[class*="title"]'); // Heuristic
                    const authorName = authorEl?.textContent?.trim() || block.getAttribute('aria-label') || "Anonymous";

                    // Rating
                    // Look for aria-label="5 stars"
                    const starsEl = block.querySelector('[role="img"][aria-label*="stars"]');
                    let rating = 0;
                    if (starsEl) {
                        const aria = starsEl.getAttribute('aria-label') || "";
                        const match = aria.match(/(\d)(\.|,)?\d?/);
                        if (match) rating = parseFloat(match[0]);
                    }

                    // Text
                    // Often in a span, sometimes with "More" button.
                    // We assume the full text is available or we take what's visible.
                    // Improving: Handle "More" button click logic inside evaluate is hard, usually handled before.
                    // For now, take visible text.
                    const textEl = block.querySelector('span[class*="text"]');
                    // Maps structure is complex, often text is in a specific data-review-id div's child
                    // A better selector for text: `span[dir="ltr"]` often holds the review body
                    const textSpan = block.querySelector('span[dir="ltr"]');
                    const text = textSpan?.textContent?.trim() || "";

                    // Time
                    const timeEl = block.querySelector('span[class*="date"], span[aria-label*="ago"]');
                    // Maps often puts time in a generic span. logic is fuzzy.
                    // Let's try finding the span that contains "ago" or date patterns
                    // Fallback to empty
                    const publishTime = ""; // Date extraction is notoriously hard on Maps without robust relative pathing

                    // Images
                    // Images are typically buttons with background images
                    const imageEls = block.querySelectorAll('button[style*="background-image"]');
                    const images = Array.from(imageEls).map(el => {
                        const style = el.getAttribute('style') || "";
                        // Extract url("...")
                        const match = style.match(/url\("?(.+?)"?\)/);
                        return match ? match[1] : null;
                    }).filter(Boolean);

                    if (authorName) {
                        results.push({
                            authorName,
                            rating,
                            text,
                            publishTime,
                            images
                        });
                    }
                });

                return results;
            });

            console.log(`Found ${reviews.length} reviews.`);

        } catch (e: any) {
            console.error(`Error scraping reviews for ${placeId}:`, e.message);
        } finally {
            if (this.browser) await this.browser.close();
        }

        // Save to DB (replace all)
        await prisma.review.deleteMany({ where: { placeId } });

        console.log(`Saving ${reviews.length} reviews...`);
        for (const review of reviews) {
            // Basic validation
            if (!review.authorName) continue;

            await prisma.review.create({
                data: {
                    placeId,
                    authorName: review.authorName,
                    rating: review.rating || 0,
                    text: review.text || "",
                    publishTime: review.publishTime || "", // Date parser needed later
                    sentiment: (review.rating >= 4) ? 'positive' : (review.rating <= 2) ? 'negative' : 'neutral',
                    images: review.images.length > 0 ? JSON.stringify(review.images) : null
                }
            });
        }
        console.log(`Review sync complete.`);
    }
}
