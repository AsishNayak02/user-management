import { z } from 'zod';

// Username validation schema
export const usernameSchema = z
  .string()
  .min(3, 'Username must be at least 3 characters')
  .max(50, 'Username must be less than 50 characters')
  .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens')
  .refine((val: string) => val.trim().length > 0, 'Username cannot be empty');

// Email validation schema
export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Please enter a valid email address')
  .max(100, 'Email must be less than 100 characters');

// Password validation schema
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(100, 'Password must be less than 100 characters')
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number');

// Complete user validation schema
export const userValidationSchema = z.object({
  username: usernameSchema,
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string().min(1, 'Confirm password is required'),
  firstName: z.string().min(1, 'First name is required').max(50, 'First name must be less than 50 characters'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name must be less than 50 characters'),
  organization: z.string().min(1, 'Organization is required'),
  group: z.string().min(1, 'Group is required'),
}).refine((data: any) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Helper function to validate individual fields
export const validateField = (field: string, value: string, allValues?: any) => {
  try {
    switch (field) {
      case 'username':
        usernameSchema.parse(value);
        return { isValid: true, error: undefined };
      case 'email':
        emailSchema.parse(value);
        return { isValid: true, error: undefined };
      case 'password':
        passwordSchema.parse(value);
        return { isValid: true, error: undefined };
      case 'confirmPassword':
        if (!value || value.trim().length === 0) {
          return { isValid: false, error: 'Confirm password is required' };
        }
        if (allValues && allValues.password !== value) {
          return { isValid: false, error: "Passwords don't match" };
        }
        return { isValid: true, error: undefined };
      case 'firstName':
        z.string().min(1, 'First name is required').max(50).parse(value);
        return { isValid: true, error: undefined };
      case 'lastName':
        z.string().min(1, 'Last name is required').max(50).parse(value);
        return { isValid: true, error: undefined };
      case 'organization':
        if (!value || value.trim().length === 0) {
          return { isValid: false, error: 'Organization is required' };
        }
        return { isValid: true, error: undefined };
      case 'group':
        if (!value || value.trim().length === 0) {
          return { isValid: false, error: 'Group is required' };
        }
        return { isValid: true, error: undefined };
      default:
        return { isValid: true, error: undefined };
    }
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return { isValid: false, error: error.errors[0].message };
    }
    return { isValid: false, error: 'Validation error' };
  }
};

// Helper function to check if username/email is ready for validation
export const isReadyForValidation = (field: string, value: string) => {
  if (!value || value.trim().length === 0) return false;
  
  switch (field) {
    case 'username':
      return value.trim().length >= 3;
    case 'email':
      return value.includes('@') && value.includes('.') && value.length > 5;
    default:
      return true;
  }
};

// Helper function to validate all fields at once
export const validateAllFields = (values: any) => {
  const errors: { [key: string]: string } = {};
  
  // Validate each field
  const fields = ['username', 'email', 'password', 'confirmPassword', 'firstName', 'lastName', 'organization', 'group'];
  
  fields.forEach(field => {
    const validation = validateField(field, values[field] || '', values);
    if (!validation.isValid) {
      errors[field] = validation.error || 'Invalid value';
    }
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Helper function to validate edit user fields (without password)
export const validateEditUserFields = (values: any) => {
  const errors: { [key: string]: string } = {};
  
  // Validate each field (excluding password fields)
  const fields = ['username', 'email', 'firstName', 'lastName', 'organization', 'group'];
  
  fields.forEach(field => {
    const validation = validateField(field, values[field] || '', values);
    if (!validation.isValid) {
      errors[field] = validation.error || 'Invalid value';
    }
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};