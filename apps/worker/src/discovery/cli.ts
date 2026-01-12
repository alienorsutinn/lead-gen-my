import { GooglePlacesApi } from './placesApi';
import { PrismaClient } from '@lead-gen-my/db';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();
const api = new GooglePlacesApi();

async function main() {
    const args = process.argv.slice(2);
    let queries: string[] = [];

    // Simple argument parsing for --queries "q1" "q2"
    const queriesIndex = args.indexOf('--queries');
    if (queriesIndex !== -1) {
        queries = args.slice(queriesIndex + 1);
    }

    if (queries.length === 0) {
        console.error('Usage: npm run worker:discover -- --queries "query 1" "query 2"');
        process.exit(1);
    }

    console.log(`Starting discovery for ${queries.length} queries:`, queries);

    for (const query of queries) {
        console.log(`\n--- Processing Query: "${query}" ---`);
        const searchResults = await api.textSearch(query);
        console.log(`Found ${searchResults.length} places for query.`);

        for (const place of searchResults) {
            console.log(`Fetching details for: ${place.name} (${place.placeId})...`);

            // Check if place already exists to avoid unnecessary API calls if we only wanted basic info,
            // but requirements say "getPlaceDetails", so we always fetch to ensure we have latest data (like website).
            // Optimization: could check if we recently updated it. For now, following requirements.

            const details = await api.getPlaceDetails(place.placeId);

            if (details) {
                try {
                    const savedPlace = await prisma.place.upsert({
                        where: { placeId: details.id },
                        create: {
                            placeId: details.id,
                            name: details.name,
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
                            name: details.name,
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
