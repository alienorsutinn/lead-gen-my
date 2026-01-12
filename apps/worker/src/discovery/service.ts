import { PrismaClient } from '@lead-gen-my/db';
import { GooglePlacesApi } from './placesApi';

const prisma = new PrismaClient(); // Or reuse shared instance passed inv
const api = new GooglePlacesApi();

export class DiscoveryService {
    async discoverAndSave(query: string): Promise<string[]> {
        const placeIds: string[] = [];

        console.log(`Processing Query: "${query}"`);
        const searchResults = await api.textSearch(query);
        console.log(`Found ${searchResults.length} places for query.`);

        for (const place of searchResults) {
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
                }
            } catch (err) {
                console.error(`Error saving place ${place.name}:`, err);
            }
        }
        return placeIds;
    }
}
