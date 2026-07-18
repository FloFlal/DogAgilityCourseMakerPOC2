import { z } from 'zod';
import { ObstacleType } from '../types/obstacleTypes';

// Schema pour un obstacle individuel
export const obstacleSchema = z.object({
  id: z.string().uuid('Invalid obstacle ID format'),
  type: z.enum([
    'jump', 'oxer', 'seesaw', 'dogWalk', 'aFrame', 
    'weavePols', 'semiWeavePols', 'tunnel6m', 'tunnel5m', 
    'tunnel4m', 'tunnel3m', 'longJump', 'tire'
  ] as [ObstacleType, ...ObstacleType[]]),
  x: z.number().finite('Obstacle x position must be a finite number'),
  y: z.number().finite('Obstacle y position must be a finite number'),
  width: z.number().positive('Obstacle width must be positive'),
  height: z.number().positive('Obstacle height must be positive'),
  fill: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Fill must be a valid hex color'),
  rotation: z.number().min(0).max(360, 'Rotation must be between 0 and 360 degrees'),
});

// Schema pour un tableau d'obstacles (format d'export)
export const courseSchema = z.array(obstacleSchema);

// Type dérivé du schema
export type ValidObstacle = z.infer<typeof obstacleSchema>;
export type ValidCourse = z.infer<typeof courseSchema>;

// Fonction pour valider un JSON de parcours
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
      // Formater les erreurs de validation
      const errorMessages = result.error.errors.map(err => {
        const path = err.path.join('.');
        return `${path}: ${err.message}`;
      });
      
      return { 
        success: false, 
        error: `Validation errors:\n${errorMessages.join('\n')}` 
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

// Fonction pour valider un obstacle individuel
export function validateObstacle(obstacle: unknown): { success: boolean; data?: ValidObstacle; error?: string } {
  const result = obstacleSchema.safeParse(obstacle);
  
  if (result.success) {
    return { 
      success: true, 
      data: result.data 
    };
  } else {
    const errorMessages = result.error.errors.map(err => {
      const path = err.path.join('.');
      return `${path}: ${err.message}`;
    });
    
    return { 
      success: false, 
      error: `Validation errors:\n${errorMessages.join('\n')}` 
    };
  }
}

// Liste des types d'obstacles valides (pour l'UI)
export const VALID_OBSTACLE_TYPES: ObstacleType[] = [
  'jump', 'oxer', 'seesaw', 'dogWalk', 'aFrame', 
  'weavePols', 'semiWeavePols', 'tunnel6m', 'tunnel5m', 
  'tunnel4m', 'tunnel3m', 'longJump', 'tire'
];

// Fonction pour vérifier si un type est valide
export function isValidObstacleType(type: string): type is ObstacleType {
  return VALID_OBSTACLE_TYPES.includes(type as ObstacleType);
}
