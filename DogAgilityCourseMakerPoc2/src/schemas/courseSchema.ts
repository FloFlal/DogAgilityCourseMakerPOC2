import { z } from 'zod';
import type { ObstacleType } from '../types/obstacleTypes';

/**
 * Zod schema of an individual obstacle: UUID identifier, regulation type,
 * position finie et positive, dimensions strictement positives, couleur
 * hexadecimal value and rotation clamped to +/-180°.
 */
export const obstacleSchema = z.object({
  id: z.string().uuid('Invalid obstacle ID format'),
  type: z.enum([
    'jump', 'oxer', 'seesaw', 'dogWalk', 'aFrame', 
    'weavePols', 'semiWeavePols', 'tunnel6m', 'tunnel5m', 
    'tunnel4m', 'tunnel3m', 'longJump', 'tire'
  ] as [ObstacleType, ...ObstacleType[]]),
  x: z.number().finite('Obstacle x position must be a finite number').nonnegative('Obstacle x position must be non-negative'),
  y: z.number().finite('Obstacle y position must be a finite number').nonnegative('Obstacle y position must be non-negative'),
  width: z.number().positive('Obstacle width must be positive'),
  height: z.number().positive('Obstacle height must be positive'),
  fill: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Fill must be a valid hex color'),
  rotation: z.number().min(-180).max(180, 'Rotation must be between -180 and 180 degrees'),
  // Optional backward-compatible field (US-020): tunnel joint chain in
  // local centimeters (pre-ratio, may be negative). Legacy courses without
  // it keep loading and render a straight tunnel.
  points: z
    .array(
      z.object({
        x: z.number().finite('Point x must be a finite number'),
        y: z.number().finite('Point y must be a finite number'),
      }),
    )
    .optional(),
});

/** Zod schema of a full course: obstacle array (.dacm.json format). */
export const courseSchema = z.array(obstacleSchema);

/** Type of a validated obstacle (inferred from the Zod schema). */
export type ValidObstacle = z.infer<typeof obstacleSchema>;
/** Type of a validated course: list of validated obstacles. */
export type ValidCourse = z.infer<typeof courseSchema>;

// Helper function to format Zod v4 errors
function formatZodError(error: z.ZodError): string {
  const errorMessages = error.issues.map(issue => {
    const path = issue.path.length > 0 ? issue.path.join('.') : 'root';
    return `${path}: ${issue.message}`;
  });
  return `Validation errors:\n${errorMessages.join('\n')}`;
}

/**
 * Validates a JSON string representing a full course.
 * Parses the JSON, checks it is an array then applies the Zod schema.
 * @param jsonString - the JSON string to validate
 * @returns the validated obstacles on success, otherwise an error message
 *          listing all validation issues
 */
export function validateCourseData(jsonString: string): { success: boolean; data?: ValidCourse; error?: string } {
  try {
    const parsed = JSON.parse(jsonString);
    
    // Check that it is an array
    if (!Array.isArray(parsed)) {
      return { 
        success: false, 
        error: 'Invalid format: expected an array of obstacles' 
      };
    }
    
    // Validate with Zod
    const result = courseSchema.safeParse(parsed);
    
    if (result.success) {
      return { 
        success: true, 
        data: result.data 
      };
    } else {
      return { 
        success: false, 
        error: formatZodError(result.error)
      };
    }
  } catch (e) {
    if (e instanceof SyntaxError) {
      return { 
        success: false, 
        error: 'Invalid JSON syntax' 
      };
    }
    return { 
      success: false, 
      error: 'Failed to parse course data' 
    };
  }
}

/**
 * Validates an individual obstacle without JSON parsing.
 * @param obstacle - the object to validate
 * @returns the validated obstacle on success, otherwise a detailed error message
 */
export function validateObstacle(obstacle: unknown): { success: boolean; data?: ValidObstacle; error?: string } {
  const result = obstacleSchema.safeParse(obstacle);
  
  if (result.success) {
    return { 
      success: true, 
      data: result.data 
    };
  } else {
    return { 
      success: false, 
      error: formatZodError(result.error)
    };
  }
}

/** Supported obstacle types, usable by the tool-choice UI. */
export const VALID_OBSTACLE_TYPES: ObstacleType[] = [
  'jump', 'oxer', 'seesaw', 'dogWalk', 'aFrame', 
  'weavePols', 'semiWeavePols', 'tunnel6m', 'tunnel5m', 
  'tunnel4m', 'tunnel3m', 'longJump', 'tire'
];

/**
 * Checks whether a string matches a known obstacle type (type guard).
 * @param type - the candidate value
 * @returns true if `type` is an ObstacleType
 */
export function isValidObstacleType(type: string): type is ObstacleType {
  return VALID_OBSTACLE_TYPES.includes(type as ObstacleType);
}
