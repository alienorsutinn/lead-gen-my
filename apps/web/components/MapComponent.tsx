'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Badge } from './ui/Badge';
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
                        <Popup className="premium-popup">
                            <div className="p-2 min-w-[200px]">
                                <Badge variant="info" className="mb-2 text-[8px] py-0">{lead.tier === 'A' ? 'High Priority' : 'Target'}</Badge>
                                <h3 className="font-black text-slate-900 text-base leading-tight mb-1">{lead.name}</h3>
                                <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3">
                                    {Math.round(lead.score)}% Growth Potential
                                </div>
                                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 mb-4">
                                    <label className="text-[8px] font-black uppercase text-indigo-500 tracking-tighter block mb-1">Critical Gap</label>
                                    <p className="text-[11px] font-bold text-slate-700 leading-snug">
                                        "{lead.primaryProblem || "Digital experience overhaul recommended."}"
                                    </p>
                                </div>
                                <a
                                    href={`/leads/${lead.id}`}
                                    className="block w-full text-center bg-slate-900 text-white py-2 rounded-lg text-xs font-bold hover:bg-black transition-all"
                                >
                                    Open Brief
                                </a>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
}
