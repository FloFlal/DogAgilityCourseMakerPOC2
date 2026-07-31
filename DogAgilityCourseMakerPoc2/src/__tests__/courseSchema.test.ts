import { describe, it, expect } from 'vitest';
import { 
    validateCourseData, 
    validateObstacle,
    isValidObstacleType,
    VALID_OBSTACLE_TYPES 
} from '../schemas/courseSchema';

describe('Course Schema Validation', () => {
    describe('validateCourseData', () => {
        it('should validate a valid course with obstacles', () => {
            const validJson = JSON.stringify([
                {
                    id: '550e8400-e29b-41d4-a716-446655440000',
                    type: 'jump',
                    x: 100,
                    y: 200,
                    width: 25,
                    height: 25,
                    fill: '#3b82f6',
                    rotation: 0
                },
                {
                    id: '550e8400-e29b-41d4-a716-446655440001',
                    type: 'seesaw',
                    x: 300,
                    y: 400,
                    width: 30,
                    height: 370,
                    fill: '#ef4444',
                    rotation: 45
                }
            ]);

            const result = validateCourseData(validJson);
            expect(result.success).toBe(true);
            expect(result.data).toBeDefined();
            expect(result.data?.length).toBe(2);
            expect(result.error).toBeUndefined();
        });

        it('should reject invalid JSON syntax', () => {
            const invalidJson = '{ invalid json }';
            const result = validateCourseData(invalidJson);
            expect(result.success).toBe(false);
            expect(result.error).toContain('Invalid JSON syntax');
        });

        it('should reject non-array data', () => {
            const nonArrayJson = JSON.stringify({ obstacles: [] });
            const result = validateCourseData(nonArrayJson);
            expect(result.success).toBe(false);
            expect(result.error).toContain('expected an array');
        });

        it('should reject obstacle with invalid ID format', () => {
            const invalidIdJson = JSON.stringify([
                {
                    id: 'invalid-id',
                    type: 'jump',
                    x: 100,
                    y: 200,
                    width: 25,
                    height: 25,
                    fill: '#3b82f6',
                    rotation: 0
                }
            ]);

            const result = validateCourseData(invalidIdJson);
            expect(result.success).toBe(false);
            expect(result.error).toContain('Invalid obstacle ID format');
        });

        it('should reject obstacle with invalid type', () => {
            const invalidTypeJson = JSON.stringify([
                {
                    id: '550e8400-e29b-41d4-a716-446655440000',
                    type: 'invalidType',
                    x: 100,
                    y: 200,
                    width: 25,
                    height: 25,
                    fill: '#3b82f6',
                    rotation: 0
                }
            ]);

            const result = validateCourseData(invalidTypeJson);
            expect(result.success).toBe(false);
            expect(result.error).toContain('Invalid option');
        });

        it('should reject obstacle with negative width', () => {
            const negativeWidthJson = JSON.stringify([
                {
                    id: '550e8400-e29b-41d4-a716-446655440000',
                    type: 'jump',
                    x: 100,
                    y: 200,
                    width: -25,
                    height: 25,
                    fill: '#3b82f6',
                    rotation: 0
                }
            ]);

            const result = validateCourseData(negativeWidthJson);
            expect(result.success).toBe(false);
            expect(result.error).toContain('must be positive');
        });

        it('should reject obstacle with invalid color format', () => {
            const invalidColorJson = JSON.stringify([
                {
                    id: '550e8400-e29b-41d4-a716-446655440000',
                    type: 'jump',
                    x: 100,
                    y: 200,
                    width: 25,
                    height: 25,
                    fill: 'red',
                    rotation: 0
                }
            ]);

            const result = validateCourseData(invalidColorJson);
            expect(result.success).toBe(false);
            expect(result.error).toContain('valid hex color');
        });

        it('should reject obstacle with rotation > 360', () => {
            const invalidRotationJson = JSON.stringify([
                {
                    id: '550e8400-e29b-41d4-a716-446655440000',
                    type: 'jump',
                    x: 100,
                    y: 200,
                    width: 25,
                    height: 25,
                    fill: '#3b82f6',
                    rotation: 400
                }
            ]);

            const result = validateCourseData(invalidRotationJson);
            expect(result.success).toBe(false);
            expect(result.error).toContain('between -180 and 180');
        });

        it('should reject obstacle with negative x position', () => {
            const negativeXJson = JSON.stringify([
                {
                    id: '550e8400-e29b-41d4-a716-446655440000',
                    type: 'jump',
                    x: -100,
                    y: 200,
                    width: 25,
                    height: 25,
                    fill: '#3b82f6',
                    rotation: 0
                }
            ]);

            const result = validateCourseData(negativeXJson);
            expect(result.success).toBe(false);
            expect(result.error).toContain('must be non-negative');
        });

        it('should reject obstacle with negative y position', () => {
            const negativeYJson = JSON.stringify([
                {
                    id: '550e8400-e29b-41d4-a716-446655440000',
                    type: 'jump',
                    x: 100,
                    y: -200,
                    width: 25,
                    height: 25,
                    fill: '#3b82f6',
                    rotation: 0
                }
            ]);

            const result = validateCourseData(negativeYJson);
            expect(result.success).toBe(false);
            expect(result.error).toContain('must be non-negative');
        });
    });

    describe('validateObstacle', () => {
        it('should validate a single valid obstacle', () => {
            const obstacle = {
                id: '550e8400-e29b-41d4-a716-446655440000',
                type: 'jump',
                x: 100,
                y: 200,
                width: 25,
                height: 25,
                fill: '#3b82f6',
                rotation: 0
            };

            const result = validateObstacle(obstacle);
            expect(result.success).toBe(true);
            expect(result.data).toBeDefined();
        });

        it('should reject an invalid obstacle', () => {
            const obstacle = {
                id: 'invalid',
                type: 'jump',
                x: 100
                // Missing required fields
            };

            const result = validateObstacle(obstacle);
            expect(result.success).toBe(false);
            expect(result.error).toBeDefined();
        });
    });

    describe('isValidObstacleType', () => {
        it('should return true for valid obstacle types', () => {
            VALID_OBSTACLE_TYPES.forEach(type => {
                expect(isValidObstacleType(type)).toBe(true);
            });
        });

        it('should return false for invalid obstacle types', () => {
            expect(isValidObstacleType('invalid')).toBe(false);
            expect(isValidObstacleType('')).toBe(false);
            expect(isValidObstacleType('jump2')).toBe(false);
        });
    });
});
