import { PrismaClient } from '@lead-gen-my/db';

const prisma = new PrismaClient();

async function setUrl() {
    // Find Premier Clinic
    const place = await prisma.place.findFirst({
        where: { name: { contains: 'Premier Clinic' } }
    });

    if (place) {
        console.log(`Updating ${place.name} (${place.id})...`);
        await prisma.place.update({
            where: { id: place.id },
            data: {
                // Using a known maps URL for demo (actually we can specificy any valid one)
                // Premier Clinic Bangsar
                googleMapsUrl: "https://www.google.com/maps/place/Premier+Clinic+-+Bangsar+Baru/@3.129897,101.669866,17z"
            }
        });
        console.log("Updated.");
    } else {
        console.log("Premier Clinic not found.");
    }
}

setUrl()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
