import dotenv from 'dotenv';

dotenv.config();

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const PLACES_RATE_LIMIT_RPS = parseInt(process.env.PLACES_RATE_LIMIT_RPS || '5', 10);

if (!GOOGLE_PLACES_API_KEY) {
    console.warn("WARNING: GOOGLE_PLACES_API_KEY is not set. Places API calls will fail.");
}

interface PlaceResult {
    placeId: string;
    name?: string;
    primaryType?: string;
    // Add other basic fields if needed for the initial search result
}

interface PlaceDetails {
    id: string; // This will map to placeId when returning
    name: string; // This is the resource name (places/...)
    displayName?: { text: string; languageCode?: string }; // Correct business name
    primaryType?: string;
    websiteUri?: string;
    nationalPhoneNumber?: string;
    formattedAddress?: string;
    rating?: number;
    userRatingCount?: number;
    googleMapsUri?: string;
    location?: {
        latitude: number;
        longitude: number;
    };
}

export class GooglePlacesApi {
    private lastRequestTime = 0;
    private minRequestInterval = 1000 / PLACES_RATE_LIMIT_RPS;

    private async rateLimit() {
        const now = Date.now();
        const timeSinceLastRequest = now - this.lastRequestTime;
        if (timeSinceLastRequest < this.minRequestInterval) {
            const waitTime = this.minRequestInterval - timeSinceLastRequest;
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }
        this.lastRequestTime = Date.now();
    }

    private async fetchWithRetry(url: string, options: RequestInit, retries = 3): Promise<any> {
        for (let i = 0; i < retries; i++) {
            await this.rateLimit();
            try {
                const response = await fetch(url, options);

                if (response.status === 429 || response.status >= 500) {
                    const backoff = Math.pow(2, i) * 1000 + Math.random() * 1000;
                    console.log(`Request failed with status ${response.status}. Retrying in ${backoff.toFixed(0)}ms...`);
                    await new Promise(resolve => setTimeout(resolve, backoff));
                    continue;
                }

                if (!response.ok) {
                    const text = await response.text();
                    throw new Error(`API request failed: ${response.status} ${response.statusText} - ${text}`);
                }

                return await response.json();
            } catch (error) {
                if (i === retries - 1) throw error;
                const backoff = Math.pow(2, i) * 1000 + Math.random() * 1000;
                console.log(`Request threw error. Retrying in ${backoff.toFixed(0)}ms... Error: ${error}`);
                await new Promise(resolve => setTimeout(resolve, backoff));
            }
        }
    }

    async textSearch(query: string, regionCode = 'MY', languageCode = 'en'): Promise<PlaceResult[]> {
        const url = 'https://places.googleapis.com/v1/places:searchText';

        const body = {
            textQuery: query,
            regionCode: regionCode,
            languageCode: languageCode
        };

        const options: RequestInit = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Goog-Api-Key': GOOGLE_PLACES_API_KEY || '',
                'X-Goog-FieldMask': 'places.id,places.displayName,places.primaryType'
            },
            body: JSON.stringify(body)
        };

        try {
            const data = await this.fetchWithRetry(url, options);
            if (!data.places) return [];

            return data.places.map((p: any) => ({
                placeId: p.id,
                name: p.displayName?.text,     // ✅ correct
                primaryType: p.primaryType
            }));
        } catch (err) {
            console.error(`Failed to search places for query "${query}":`, err);
            return [];
        }
    }

    async getPlaceDetails(placeId: string): Promise<PlaceDetails | null> {
        const url = `https://places.googleapis.com/v1/places/${placeId}`;

        // Fields we want to fetch
        const fields = [
            'id',
            'displayName',
            'primaryType',
            'websiteUri',
            'nationalPhoneNumber',
            'formattedAddress',
            'rating',
            'userRatingCount',
            'googleMapsUri',
            'location'
        ];

        const options: RequestInit = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-Goog-Api-Key': GOOGLE_PLACES_API_KEY || '',
                'X-Goog-FieldMask': fields.join(',')
            }
        };

        try {
            const data = await this.fetchWithRetry(url, options);
            return data as PlaceDetails;
        } catch (err) {
            console.error(`Failed to get details for placeId "${placeId}":`, err);
            return null;
        }
    }
}
