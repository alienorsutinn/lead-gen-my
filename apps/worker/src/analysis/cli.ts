import { Command } from 'commander';
import { prisma } from '@lead-gen-my/db';
import { Orchestrator } from './orchestrator';

const program = new Command();

program
    .name('worker:analyze')
    .description('Run full Lead Ops analysis pipeline')
    .option('--limit <n>', 'Limit number of leads', '5')
    .action(async (options) => {
        const orchestrator = new Orchestrator();

        try {
            // Find places that haven't been scored yet OR strictly just take N
            // User request: "batch processing via worker CLI"
            // Let's pick recent places without recommendations
            const places = await prisma.place.findMany({
                where: {
                    opsRecommendations: { none: {} }
                },
                take: parseInt(options.limit)
            });

            console.log(`[CLI] Found ${places.length} places to analyze.`);

            for (const place of places) {
                await orchestrator.analyzePlace(place.placeId);
            }

        } catch (e) {
            console.error(e);
            process.exit(1);
        } finally {
            await prisma.$disconnect();
            process.exit(0);
        }
    });

program.parseAsync(process.argv);
