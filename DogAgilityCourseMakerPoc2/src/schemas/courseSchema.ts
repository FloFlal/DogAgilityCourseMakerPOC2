import { z } from 'zod';
import type { ObstacleType } from '../types/obstacleTypes';

/**
 * Schéma Zod d'un obstacle individuel : identifiant UUID, type réglementaire,
 * position finie et positive, dimensions strictement positives, couleur
 * hexadécimale et rotation bornée à ±180°.
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
});

/** Schéma Zod d'un parcours complet : tableau d'obstacles (format .dacm.json). */
export const courseSchema = z.array(obstacleSchema);

/** Type d'un obstacle validé (inféré du schéma Zod). */
export type ValidObstacle = z.infer<typeof obstacleSchema>;
/** Type d'un parcours validé : liste d'obstacles validés. */
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
 * Valide une chaîne JSON représentant un parcours complet.
 * Parse le JSON, vérifie que c'est un tableau puis applique le schéma Zod.
 * @param jsonString - la chaîne JSON à valider
 * @returns les obstacles validés en cas de succès, sinon un message d'erreur
 *          listant tous les problèmes de validation
 */
export function validateCourseData(jsonString: string): { success: boolean; data?: ValidCourse; error?: string } {
  try {
    const parsed = JSON.parse(jsonString);
    
    // Vérifier que c'est un tableau
    if (!Array.isArray(parsed)) {
      return { 
        success: false, 
        error: 'Invalid format: expected an array of obstacles' 
      };
    }
    
    // Valider avec Zod
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
 * Valide un obstacle individuel sans parsing JSON.
 * @param obstacle - l'objet à valider
 * @returns l'obstacle validé en cas de succès, sinon un message d'erreur détaillé
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

/** Types d'obstacles supportés, utilisables par l'UI de choix d'outil. */
export const VALID_OBSTACLE_TYPES: ObstacleType[] = [
  'jump', 'oxer', 'seesaw', 'dogWalk', 'aFrame', 
  'weavePols', 'semiWeavePols', 'tunnel6m', 'tunnel5m', 
  'tunnel4m', 'tunnel3m', 'longJump', 'tire'
];

/**
 * Vérifie qu'une chaîne correspond à un type d'obstacle connu (garde de type).
 * @param type - la valeur candidate
 * @returns true si `type` est un ObstacleType
 */
export function isValidObstacleType(type: string): type is ObstacleType {
  return VALID_OBSTACLE_TYPES.includes(type as ObstacleType);
}
