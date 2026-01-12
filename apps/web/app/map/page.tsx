import { getOpportunities } from '../../actions/opportunities';
import dynamic from 'next/dynamic';
import Link from 'next/link';

// Map cannot be SSR'd because of Leaflet window reliance
const MapComponent = dynamic(
    () => import('../../components/MapComponent'),
    {
        ssr: false,
        loading: () => <div className="h-[700px] bg-gray-100 animate-pulse flex items-center justify-center">Initializing Map Framework...</div>
    }
);

export default async function MapPage() {
    // Fetch Tier A opportunities (up to 500)
    const { data: opportunities } = await getOpportunities(1, 500, {
        tier: 'A'
    });

    // Map to simplified interface
    const mapOpportunities = opportunities.map(o => ({
        id: o.id,
        name: o.name,
        lat: o.lat,
        lng: o.lng,
        score: o.opportunities[0]?.score || 0,
        tier: o.opportunities[0]?.tier || 'A',
        primaryProblem: (o as any).primaryProblem || "Analysis in progress"
    }));

    return (
        <div className="container mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold">High Value Opportunity Map</h1>
                    <p className="text-gray-500 mt-1">Showing {mapOpportunities.length} high-value targets in KLang Valley</p>
                </div>
                <div className="flex gap-4">
                    <Link href="/opportunities" className="bg-white border p-2 rounded hover:bg-gray-50">Back to List</Link>
                    <Link href="/" className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700">Home</Link>
                </div>
            </div>

            <MapComponent opportunities={mapOpportunities} />

            <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-800">
                <strong>Tip:</strong> Use this map to plan your physical outreach rounds. High Value opportunities are typically located in commercial clusters (PJ, Subang, KL City).
            </div>
        </div>
    );
}
