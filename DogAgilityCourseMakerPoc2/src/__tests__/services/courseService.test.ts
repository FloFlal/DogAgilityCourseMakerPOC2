import { describe, expect, it } from 'vitest';
import { exportCourse, importCourse } from '../../services/courseService';
import type { Obstacle } from '../../types/obstacleTypes';

const UUID = '11111111-1111-4111-8111-111111111111';

const makeObstacle = (id: string): Obstacle => ({
    id,
    type: 'jump',
    x: 10,
    y: 20,
    width: 25,
    height: 25,
    fill: '#3b82f6',
    rotation: 0,
});

describe('courseService', () => {
    describe('exportCourse', () => {
        it('sérialise le parcours en JSON indenté', () => {
            const json = exportCourse([makeObstacle(UUID)]);

            expect(JSON.parse(json)).toEqual([makeObstacle(UUID)]);
            expect(json).toContain('\n');
        });

        it('sérialise un parcours vide', () => {
            expect(exportCourse([])).toBe('[]');
        });
    });

    describe('importCourse', () => {
        it('importe un parcours valide', () => {
            const result = importCourse(exportCourse([makeObstacle(UUID)]));

            expect(result.success).toBe(true);
            expect(result.data).toEqual([makeObstacle(UUID)]);
            expect(result.error).toBeUndefined();
        });

        it('rejette un JSON invalide', () => {
            const result = importCourse('{not json');

            expect(result.success).toBe(false);
            expect(result.error).toEqual({ code: 'import.errors.invalidJson' });
        });

        it('rejette un format non tableau', () => {
            const result = importCourse('{"id": "a"}');

            expect(result.success).toBe(false);
            expect(result.error).toEqual({ code: 'import.errors.invalidFormat' });
        });

        it('rejette un obstacle invalide', () => {
            const result = importCourse('[{"id": "not-a-uuid", "type": "jump"}]');

            expect(result.success).toBe(false);
            expect(result.error?.code).toBe('import.errors.validationFailed');
            expect(result.error?.issues?.length).toBeGreaterThan(0);
        });
    });
});
