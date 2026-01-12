'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet + Next.js
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapLead {
    id: string;
    name: string;
    lat: number | null;
    lng: number | null;
    score: number;
    tier: string;
}

export default function MapComponent({ leads }: { leads: MapLead[] }) {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) return <div className="h-[600px] w-full bg-gray-100 animate-pulse flex items-center justify-center">Loading Map...</div>;

    // Filter leads with valid coordinates
    const validLeads = leads.filter(l => l.lat !== null && l.lng !== null);

    // Center map on the first lead or Klang Valley defaults
    const center: [number, number] = validLeads.length > 0
        ? [validLeads[0].lat!, validLeads[0].lng!]
        : [3.1390, 101.6869]; // KL Center

    return (
        <div className="h-[700px] w-full border rounded-lg overflow-hidden shadow-lg">
            <MapContainer center={center} zoom={12} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {validLeads.map(lead => (
                    <Marker key={lead.id} position={[lead.lat!, lead.lng!]}>
                        <Popup>
                            <div className="p-1">
                                <h3 className="font-bold text-sm">{lead.name}</h3>
                                <div className="text-xs mt-1">
                                    <span className="font-bold text-blue-600">Score: {lead.score}</span>
                                    <span className="ml-2 text-gray-500">Tier {lead.tier}</span>
                                </div>
                                <a
                                    href={`/leads/${lead.id}`}
                                    className="block mt-2 text-xs text-blue-500 underline"
                                >
                                    View Details
                                </a>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
}
