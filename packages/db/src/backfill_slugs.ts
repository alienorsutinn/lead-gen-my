
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

function slugify(text: string) {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')     // Replace spaces with -
        .replace(/[^\w\-]+/g, '') // Remove all non-word chars
        .replace(/\-\-+/g, '-');  // Replace multiple - with single -
}

async function main() {
    const places = await prisma.place.findMany({
        where: { slug: null }
    });

    console.log(`Found ${places.length} places without slugs.`);

    for (const place of places) {
        let slug = slugify(place.name);

        // Ensure uniqueness (simple check)
        let count = 0;
        let uniqueSlug = slug;
        while (await prisma.place.count({ where: { slug: uniqueSlug } }) > 0) {
            count++;
            uniqueSlug = `${slug}-${count}`;
        }

        await prisma.place.update({
            where: { id: place.id },
            data: { slug: uniqueSlug }
        });
        console.log(`Updated ${place.name} -> ${uniqueSlug}`);
    }
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
