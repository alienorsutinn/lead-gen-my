import { getLeads } from '../../actions/leads';
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
    // Fetch Tier A leads (up to 500)
    const { data: leads } = await getLeads(1, 500, {
        tier: 'A'
    });

    // Map to simplified interface
    const mapLeads = leads.map(l => ({
        id: l.id,
        name: l.name,
        lat: l.lat,
        lng: l.lng,
        score: l.leadScores[0]?.score || 0,
        tier: l.leadScores[0]?.tier || 'A'
    }));

    return (
        <div className="container mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold">Tier A Opportunity Map</h1>
                    <p className="text-gray-500 mt-1">Showing {mapLeads.length} high-priority leads in Klang Valley</p>
                </div>
                <div className="flex gap-4">
                    <Link href="/leads" className="bg-white border p-2 rounded hover:bg-gray-50">Back to List</Link>
                    <Link href="/" className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700">Home</Link>
                </div>
            </div>

            <MapComponent leads={mapLeads} />

            <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-800">
                <strong>Tip:</strong> Use this map to plan your physical outreach rounds. Tier A leads are typically located in commercial clusters (PJ, Subang, KL City).
            </div>
        </div>
    );
}
