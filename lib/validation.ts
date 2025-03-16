import { TextCustomization } from './types/customization';

type ValidationResult = {
  valid: boolean;
  errors: {
    line1?: string;
    line2?: string;
  };
};

/**
 * Validates text customization for the hat
 * @param customization The text customization to validate
 * @param maxLength Maximum character length for each line (default: 20)
 * @returns Validation result with errors if any
 */
export function validateCustomization(
  customization: TextCustomization,
  maxLength: number = 20
): ValidationResult {
  const errors: ValidationResult['errors'] = {};

  // Validate line1 is required
  if (!customization.line1 || customization.line1.trim() === '') {
    errors.line1 = 'Line 1 text is required';
  }

  // Validate line1 length
  if (customization.line1 && customization.line1.length > maxLength) {
    errors.line1 = `Line 1 must be ${maxLength} characters or less`;
  }

  // Validate line2 length if provided
  if (customization.line2 && customization.line2.length > maxLength) {
    errors.line2 = `Line 2 must be ${maxLength} characters or less`;
  }

  // Check for invalid characters (optional)
  const invalidCharsRegex = /[^\w\s.,!?-]/g;

  if (customization.line1 && invalidCharsRegex.test(customization.line1)) {
    errors.line1 = errors.line1 || 'Line 1 contains invalid characters';
  }

  if (customization.line2 && invalidCharsRegex.test(customization.line2)) {
    errors.line2 = errors.line2 || 'Line 2 contains invalid characters';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Sanitizes text input for customization
 * @param text The text to sanitize
 * @returns Sanitized text
 */
export function sanitizeCustomizationText(text: string): string {
  // Remove any potentially harmful characters
  // This is a simple example - in production you might want more sophisticated sanitization
  return text.replace(/[^\w\s.,!?-]/g, '').trim();
}
