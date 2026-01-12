import { GooglePlacesApi } from './placesApi';
import { PrismaClient } from '@lead-gen-my/db';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();
const api = new GooglePlacesApi();

import fs from 'fs/promises';

// ... imports ...

async function main() {
    const args = process.argv.slice(2);
    let queries: string[] = [];

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
        console.error('Usage: npm run worker:discover -- --queries "query 1" OR --queriesFile data/queries.json');
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
