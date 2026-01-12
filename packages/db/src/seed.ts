import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Start seeding...');

    // Cleanup existing data
    await prisma.jobRun.deleteMany();
    await prisma.leadScore.deleteMany();
    await prisma.llmVerdict.deleteMany();
    await prisma.screenshot.deleteMany();
    await prisma.psiAudit.deleteMany();
    await prisma.websiteCheck.deleteMany();
    await prisma.place.deleteMany();

    // Create Mock Places
    const place1 = await prisma.place.create({
        data: {
            placeId: 'ChIJaaaaaaaaaa1',
            name: 'Tech Solutions Sdn Bhd',
            primaryType: 'software_company',
            address: '123 Jalan Tech, Kuala Lumpur',
            phone: '+60 3-1234 5678',
            rating: 4.8,
            userRatingCount: 120,
            websiteUrl: 'https://techsolutions.my',
            googleMapsUrl: 'https://maps.google.com/?q=...',
            websiteCheck: {
                create: {
                    url: 'https://techsolutions.my',
                    status: 'ok',
                    https: true,
                    httpStatus: 200
                }
            },
            psiAudits: {
                create: {
                    url: 'https://techsolutions.my',
                    strategy: 'mobile',
                    performance: 85,
                    seo: 92,
                    accessibility: 90,
                    bestPractices: 88
                }
            },
            leadScores: {
                create: {
                    score: 95,
                    tier: 'A',
                    breakdown: {
                        details: 'High intent, strong digial presence'
                    }
                }
            },
            llmVerdicts: {
                create: {
                    needsIntervention: false,
                    severity: 'low',
                    reasons: ['Good website', 'Active social media'],
                    quickWins: [],
                    offerAngle: 'Upsell advanced SEO'
                }
            }
        }
    });

    const place2 = await prisma.place.create({
        data: {
            placeId: 'ChIJbbbbbbbbbb2',
            name: 'Old School Hardware',
            primaryType: 'hardware_store',
            address: '456 Jalan Lama, Penang',
            phone: '+60 4-5555 6666',
            rating: 3.5,
            userRatingCount: 15,
            websiteUrl: 'http://oldschool.com.my',
            websiteCheck: {
                create: {
                    url: 'http://oldschool.com.my',
                    status: 'broken',
                    https: false,
                    httpStatus: 404,
                    errors: 'Connection refused'
                }
            },
            leadScores: {
                create: {
                    score: 40,
                    tier: 'C',
                    breakdown: {
                        details: 'No working website, low ratings'
                    }
                }
            },
            llmVerdicts: {
                create: {
                    needsIntervention: true,
                    severity: 'high',
                    reasons: ['Website down', 'Low ratings'],
                    quickWins: ['Build landing page', 'Claim GMB listing'],
                    offerAngle: 'Complete digital transformation package'
                }
            }
        }
    });

    console.log({ place1, place2 });
    console.log('Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
