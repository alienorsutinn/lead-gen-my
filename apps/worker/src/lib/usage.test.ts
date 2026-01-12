import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UsageTracker, METRICS } from './usage';
import { PrismaClient } from '@lead-gen-my/db';

// Mock Prisma logic
const mocks = vi.hoisted(() => ({
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn()
}));

vi.mock('@lead-gen-my/db', () => {
    return {
        PrismaClient: class {
            dailyUsage = {
                findUnique: mocks.findUnique,
                create: mocks.create,
                update: mocks.update
            }
        }
    };
});

describe('UsageTracker', () => {
    let tracker: UsageTracker;

    beforeEach(() => {
        vi.clearAllMocks();
        // Since we import mocks via closure, we need to reset them manually or expose them
        tracker = new UsageTracker();
    });

    it('should allow if usage is within limit', async () => {
        // Mock current usage = 0
        mocks.findUnique.mockResolvedValue({ id: '1', count: 0 });
        mocks.update.mockResolvedValue({ id: '1', count: 1 });

        // Limit is 100 for PSI default
        const result = await tracker.checkAndIncrement(METRICS.PSI_AUDIT, 1);
        expect(result).toBe(true);
        expect(mocks.update).toHaveBeenCalled();
    });

    it('should block if usage exceeds limit', async () => {
        // Limit is 100. Mock usage = 100.
        mocks.findUnique.mockResolvedValue({ id: '1', count: 100 });

        const result = await tracker.checkAndIncrement(METRICS.PSI_AUDIT, 1);
        expect(result).toBe(false);
        expect(mocks.update).not.toHaveBeenCalled();
    });
});
