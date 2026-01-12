import { PrismaClient } from '@lead-gen-my/db';
import { GooglePlacesApi } from './placesApi';

const prisma = new PrismaClient(); // Or reuse shared instance passed inv
const api = new GooglePlacesApi();

export class DiscoveryService {
    async discoverAndSave(query: string): Promise<string[]> {
        const placeIds: string[] = [];
        let nextPageToken: string | undefined = undefined;
        let pageCount = 0;
        const MAX_PAGES = 3; // Google Places API limit for text search mostly

        console.log(`Processing Query: "${query}"`);

        do {
            pageCount++;
            console.log(`Fetching page ${pageCount}...`);
            const searchResult: { places: any[], nextPageToken?: string } = await api.textSearch(query, 'MY', 'en', nextPageToken);
            console.log(`Found ${searchResult.places.length} places on page ${pageCount}.`);

            const places = searchResult.places;
            nextPageToken = searchResult.nextPageToken;

            for (const place of places) {
                try {
                    const details = await api.getPlaceDetails(place.placeId);

                    if (details) {
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
                        placeIds.push(savedPlace.id);
                        process.stdout.write('.');
                    }
                } catch (err) {
                    console.error(`Error saving place ${place.name}:`, err);
                }
            }
            console.log(''); // New line

            // Google requires a short delay before the next page token is valid
            if (nextPageToken) {
                await new Promise(resolve => setTimeout(resolve, 2000));
            }

        } while (nextPageToken && pageCount < MAX_PAGES);

        return placeIds;
    }
}
