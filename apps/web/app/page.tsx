import { prisma } from '@lead-gen-my/db';

async function getLeads() {
    try {
        return await prisma.place.findMany({
            orderBy: { createdAt: 'desc' },
            take: 10
        });
    } catch (e) {
        console.error("DB Error", e);
        return [];
    }
}

export default async function Home() {
    const leads = await getLeads();

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6">Lead Gen Dashboard</h1>

            <div className="grid gap-4">
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-4">Recent Leads</h2>
                    {leads.length === 0 ? (
                        <p className="text-gray-500">No leads found. Run the worker to generate leads.</p>
                    ) : (
                        <ul className="space-y-2">
                            {leads.map(lead => (
                                <li key={lead.id} className="border-b pb-2">
                                    <div className="font-medium">{lead.name}</div>
                                    <div className="text-sm text-gray-600">{lead.rating ? `Rating: ${lead.rating}` : 'No rating'}</div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    )
}
