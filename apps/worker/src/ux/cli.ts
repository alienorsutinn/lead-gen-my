import { Command } from 'commander';
import { prisma } from '@lead-gen-my/db';
import { UxAuditService } from './service';

const program = new Command();

program
    .name('worker:ux')
    .description('Run UX friction audit on places')
    .option('--placeId <id>', 'Specific place ID to audit')
    .option('--limit <n>', 'Batch size for auto-discovery', '5')
    .action(async (options) => {
        const service = new UxAuditService();

        try {
            if (options.placeId) {
                await service.auditPlace(options.placeId);
            } else {
                // Find places with website but no UX Audit yet
                const places = await prisma.place.findMany({
                    where: {
                        websiteUrl: { not: null },
                        uxAudits: { none: {} }
                    },
                    take: parseInt(options.limit),
                });

                console.log(`[CLI] Found ${places.length} places to audit.`);

                for (const place of places) {
                    await service.auditPlace(place.placeId);
                }
            }
        } catch (e) {
            console.error(e);
            process.exit(1);
        } finally {
            await prisma.$disconnect();
            // Ensure browser is closed if we exposed it, but service creates engine lazily
            // In a real long-running worker we'd manage lifecycle better
            process.exit(0);
        }
    });

program.parseAsync(process.argv);
