import { z } from 'zod';

// Role name validation schema
export const roleNameSchema = z
  .string()
  .min(2, 'Role name must be at least 2 characters')
  .max(50, 'Role name must be less than 50 characters')
  .regex(/^[a-zA-Z0-9_-]+$/, 'Role name can only contain letters, numbers, underscores, and hyphens')
  .refine((val: string) => val.trim().length > 0, 'Role name cannot be empty');

// Role description validation schema
export const roleDescriptionSchema = z
  .string()
  .max(200, 'Description must be less than 200 characters')
  .optional();

// Create role validation schema
export const createRoleSchema = z.object({
  name: roleNameSchema,
  description: roleDescriptionSchema,
  type: z.enum(['realm', 'client'], {
    required_error: 'Role type is required',
  }),
  clientId: z.string().optional(),
}).refine((data) => {
  // If type is 'client', clientId is required
  if (data.type === 'client' && !data.clientId) {
    return false;
  }
  return true;
}, {
  message: 'Client ID is required for client roles',
  path: ['clientId'],
});

// Assign client roles validation schema
export const assignClientRolesSchema = z.object({
  realmRoleId: z.string().min(1, 'Realm role ID is required'),
  clientRoleIds: z.array(z.string()).min(1, 'At least one client role must be selected'),
});

// Update role validation schema
export const updateRoleSchema = z.object({
  name: roleNameSchema,
  description: roleDescriptionSchema,
});

// Helper function to validate individual role fields
export const validateRoleField = (field: string, value: string) => {
  try {
    switch (field) {
      case 'name':
        roleNameSchema.parse(value);
        return { isValid: true, error: undefined };
      case 'description':
        if (value) {
          roleDescriptionSchema.parse(value);
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

// Helper function to check if role name is ready for validation
export const isRoleNameReadyForValidation = (value: string) => {
  return value.trim().length >= 2;
};

// Helper function to validate all role fields at once
export const validateAllRoleFields = (values: any) => {
  const errors: { [key: string]: string } = {};
  
  const fields = ['name', 'description'];
  
  fields.forEach(field => {
    const validation = validateRoleField(field, values[field] || '');
    if (!validation.isValid) {
      errors[field] = validation.error || 'Invalid value';
    }
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
