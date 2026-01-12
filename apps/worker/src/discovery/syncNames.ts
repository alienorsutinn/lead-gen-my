import { prisma } from '@lead-gen-my/db';
import { GooglePlacesApi } from './placesApi';

async function syncNames() {
    console.log('Starting Business Name Synchronization...');
    const googleApi = new GooglePlacesApi();

    // Find all places where name starts with "places/" or is identical to the ID
    const places = await prisma.place.findMany({
        where: {
            OR: [
                { name: { startsWith: 'places/' } },
                { name: { contains: 'ChI' } } // Common prefix for place IDs
            ]
        }
    });

    console.log(`Found ${places.length} places needing name updates.`);

    for (const place of places) {
        console.log(`Updating ${place.placeId} (internal id: ${place.id})...`);
        const details = await googleApi.getPlaceDetails(place.placeId);

        if (details && details.displayName?.text) {
            await prisma.place.update({
                where: { id: place.id },
                data: { name: details.displayName.text }
            });
            console.log(` -> Updated to: ${details.displayName.text}`);
        } else {
            console.log(` -> Failed to get details for ${place.id}`);
        }

        // Sleep briefly to respect API quotas
        await new Promise(resolve => setTimeout(resolve, 200));
    }

    console.log('Synchronization complete!');
}

syncNames().catch(err => {
    console.error('Sync failed:', err);
    process.exit(1);
});
