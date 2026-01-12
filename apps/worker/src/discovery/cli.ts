import { GooglePlacesApi } from './placesApi';
import { PrismaClient } from '@lead-gen-my/db';
import dotenv from 'dotenv';
import { ReviewService } from '../reviews/service';

dotenv.config();

const prisma = new PrismaClient();
const api = new GooglePlacesApi();

import fs from 'fs/promises';

async function main() {
    const args = process.argv.slice(2);
    let queries: string[] = [];
    const deepReviews = args.includes('--deep-reviews');

    // Parse --queries argument
    const queriesIndex = args.indexOf('--queries');
    if (queriesIndex !== -1) {
        queries = args.slice(queriesIndex + 1);
    }

    // Parse --queriesFile argument
    const fileIndex = args.indexOf('--queriesFile');
    if (fileIndex !== -1 && args[fileIndex + 1]) {
        try {
            const raw = await fs.readFile(args[fileIndex + 1], 'utf-8');
            const json = JSON.parse(raw);
            if (Array.isArray(json)) {
                queries = queries.concat(json.map((q: any) => q.query));
            }
        } catch (err) {
            console.error('Failed to read queries file:', err);
            process.exit(1);
        }
    }

    if (queries.length === 0) {
        // Fallback to simple query if passed as first arg
        if (args.length > 0 && !args[0].startsWith('--')) {
            queries.push(args[0]);
        } else {
            console.error('Usage: npm run worker:discover -- --queries "query 1" OR --queriesFile data/queries.json OR "query string"');
            process.exit(1);
        }
    }

    console.log(`Starting discovery for ${queries.length} queries:`, queries);

    for (const query of queries) {
        console.log(`\n--- Processing Query: "${query}" ---`);
        const searchResults = await api.textSearch(query);
        console.log(`Found ${searchResults.places.length} places for query.`);

        for (const place of searchResults.places) {
            console.log(`Fetching details for: ${place.name} (${place.placeId})...`);

            const details = await api.getPlaceDetails(place.placeId);

            if (details) {
                try {
                    const savedPlace = await prisma.place.upsert({
                        where: { placeId: details.id },
                        create: {
                            placeId: details.id,
                            name: details.displayName?.text ?? details.id,
                            primaryType: details.primaryType || null,
                            address: details.formattedAddress || null,
                            phone: details.nationalPhoneNumber || null,
                            rating: details.rating || null,
                            userRatingCount: details.userRatingCount || null,
                            websiteUrl: details.websiteUri || null,
                            googleMapsUrl: details.googleMapsUri || null,
                            lat: details.location?.latitude || null,
                            lng: details.location?.longitude || null,
                        },
                        update: {
                            name: details.displayName?.text ?? details.id,
                            primaryType: details.primaryType || null,
                            address: details.formattedAddress || null,
                            phone: details.nationalPhoneNumber || null,
                            rating: details.rating || null,
                            userRatingCount: details.userRatingCount || null,
                            websiteUrl: details.websiteUri || null,
                            googleMapsUrl: details.googleMapsUri || null,
                            lat: details.location?.latitude || null,
                            lng: details.location?.longitude || null,
                        }
                    });
                    console.log(`Saved/Updated: ${savedPlace.name} (ID: ${savedPlace.id}) - Website: ${savedPlace.websiteUrl || 'N/A'}`);

                    // Save Reviews
                    if (deepReviews && savedPlace.googleMapsUrl) {
                        console.log(`  > Deep scraping up to 100 reviews for: ${savedPlace.name}...`);
                        const reviewService = new ReviewService();
                        await reviewService.fetchReviews(savedPlace.placeId, savedPlace.googleMapsUrl, 100);
                    } else if (details.reviews && details.reviews.length > 0) {
                        console.log(`  > Saving ${details.reviews.length} basic reviews from API...`);
                        await prisma.review.deleteMany({ where: { placeId: savedPlace.id } }); // Refresh reviews

                        for (const r of details.reviews) {
                            if (!r.text?.text) continue;
                            await prisma.review.create({
                                data: {
                                    placeId: savedPlace.id,
                                    authorName: r.authorAttribution?.displayName || 'Anonymous',
                                    rating: r.rating,
                                    text: r.text.text,
                                    publishTime: r.relativePublishTimeDescription,
                                }
                            });
                        }
                    }
                } catch (dbErr) {
                    console.error(`Failed to save place ${details.name}:`, dbErr);
                }
            }
        }
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
