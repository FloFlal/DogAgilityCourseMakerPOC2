import { z } from 'zod';
import type { ObstacleType } from '../types/obstacleTypes';

/**
 * Structured validation issue: an i18n error code plus the dotted path of
 * the offending value (e.g. "2.width"), instead of a frozen English string.
 * The UI translates the code with i18next in the current language.
 */
export interface ImportIssue {
    /** Dotted path of the offending value ("root" when at the top level). */
    path: string;
    /** i18n key of the issue message (e.g. "import.errors.widthPositive"). */
    code: string;
}

/**
 * Structured import error: a top-level i18n code plus the detailed list of
 * validation issues (kept so the UI can display them collapsed). The schema
 * and the service never produce user-facing strings: they only produce
 * codes, and the UI translates them in the current language.
 */
export interface ImportError {
    /** i18n key of the main error message (e.g. "import.errors.invalidJson"). */
    code: string;
    /** Detailed validation issues, when the error comes from the schema. */
    issues?: ImportIssue[];
}

/**
 * Fallback i18n codes for Zod issues that carry no custom coded message
 * (defensive: every validator below sets one, so this only triggers if a
 * validator is added without its code).
 */
const GENERIC_ISSUE_CODES: Record<string, string> = {
    invalid_type: 'import.errors.invalidValue',
    invalid_value: 'import.errors.invalidValue',
    invalid_format: 'import.errors.invalidValue',
    invalid_union: 'import.errors.invalidValue',
    invalid_key: 'import.errors.invalidValue',
    invalid_element: 'import.errors.invalidValue',
    too_small: 'import.errors.invalidValue',
    too_big: 'import.errors.invalidValue',
    not_multiple_of: 'import.errors.invalidValue',
    unrecognized_keys: 'import.errors.invalidValue',
    custom: 'import.errors.invalidValue',
};

/** Top-level i18n codes of the import failures. */
export const IMPORT_ERROR_CODES = {
    invalidFormat: 'import.errors.invalidFormat',
    invalidJson: 'import.errors.invalidJson',
    parseFailed: 'import.errors.parseFailed',
    importFailed: 'import.errors.importFailed',
    validationFailed: 'import.errors.validationFailed',
    invalidValue: 'import.errors.invalidValue',
} as const;

/**
 * Zod schema of an individual obstacle: UUID identifier, regulation type,
 * finite and positive position, strictly positive dimensions, hexadecimal
 * fill value and rotation clamped to +/-180 deg. Every validator carries an
 * i18n error code as its message: the schema produces codes, never strings.
 */
export const obstacleSchema = z.object({
  id: z.string().uuid('import.errors.obstacleId'),
  type: z.enum([
    'jump', 'oxer', 'seesaw', 'dogWalk', 'aFrame',
    'weavePols', 'semiWeavePols', 'tunnel6m', 'tunnel5m',
    'tunnel4m', 'tunnel3m', 'longJump', 'tire'
  ] as [ObstacleType, ...ObstacleType[]], 'import.errors.obstacleType'),
  x: z.number().finite('import.errors.xFinite').nonnegative('import.errors.xNonNegative'),
  y: z.number().finite('import.errors.yFinite').nonnegative('import.errors.yNonNegative'),
  width: z.number().positive('import.errors.widthPositive'),
  height: z.number().positive('import.errors.heightPositive'),
  fill: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'import.errors.fillHexColor'),
  rotation: z.number().min(-180).max(180, 'import.errors.rotationRange'),
  // Optional backward-compatible field (US-020): tunnel joint chain in
  // local centimeters (pre-ratio, may be negative). Legacy courses without
  // it keep loading and render a straight tunnel.
  points: z
    .array(
      z.object({
        x: z.number().finite('import.errors.pointXFinite'),
        y: z.number().finite('import.errors.pointYFinite'),
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

// Maps a Zod error to the structured issues (i18n code + dotted path) the
// UI renders as the collapsed validation details.
function toImportError(error: z.ZodError): ImportError {
  const issues = error.issues.map(issue => {
    const path = issue.path.length > 0 ? issue.path.join('.') : 'root';
    const code = issue.message.startsWith('import.')
      ? issue.message
      : GENERIC_ISSUE_CODES[issue.code] ?? IMPORT_ERROR_CODES.invalidValue;

    return { path, code };
  });

  return { code: IMPORT_ERROR_CODES.validationFailed, issues };
}

/**
 * Validates a JSON string representing a full course.
 * Parses the JSON, checks it is an array then applies the Zod schema.
 * @param jsonString - the JSON string to validate
 * @returns the validated obstacles on success, otherwise a structured
 *          error (i18n code + optional detailed validation issues)
 */
export function validateCourseData(jsonString: string): { success: boolean; data?: ValidCourse; error?: ImportError } {
  try {
    const parsed = JSON.parse(jsonString);

    // Check that it is an array
    if (!Array.isArray(parsed)) {
      return {
        success: false,
        error: { code: IMPORT_ERROR_CODES.invalidFormat }
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
        error: toImportError(result.error)
      };
    }
  } catch (e) {
    if (e instanceof SyntaxError) {
      return {
        success: false,
        error: { code: IMPORT_ERROR_CODES.invalidJson }
      };
    }
    return {
      success: false,
      error: { code: IMPORT_ERROR_CODES.parseFailed }
    };
  }
}

/**
 * Validates an individual obstacle without JSON parsing.
 * @param obstacle - the object to validate
 * @returns the validated obstacle on success, otherwise a structured error
 *          (i18n code + detailed validation issues)
 */
export function validateObstacle(obstacle: unknown): { success: boolean; data?: ValidObstacle; error?: ImportError } {
  const result = obstacleSchema.safeParse(obstacle);

  if (result.success) {
    return {
      success: true,
      data: result.data
    };
  } else {
    return {
      success: false,
      error: toImportError(result.error)
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
