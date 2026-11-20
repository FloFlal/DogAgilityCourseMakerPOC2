import { describe, expect, it } from 'vitest';
import * as schemas from '../../schemas';

describe('Barrel des schémas de validation', () => {
    it('réexporte les schémas et fonctions de validation', () => {
        expect(typeof schemas.validateCourseData).toBe('function');
        expect(typeof schemas.validateObstacle).toBe('function');
        expect(schemas.obstacleSchema).toBeTruthy();
        expect(schemas.courseSchema).toBeTruthy();
    });
});
