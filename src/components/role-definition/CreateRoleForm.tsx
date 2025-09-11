"use client"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useFormik } from "formik"
import { useState, useEffect } from "react"
import { createRole, getAllClients, getClientRoles } from "@/api/roleManagement"
import { validateRoleField, isRoleNameReadyForValidation, validateAllRoleFields } from "@/lib/validation/role"
import { CreateRoleFormData } from "@/lib/types/role"

interface CreateRoleFormProps {
  onRoleCreated: () => void;
}

const initialFormData: CreateRoleFormData = {
  name: "",
  description: "",
  type: "realm",
  clientId: "",
  clientRoleIds: [],
}

export function CreateRoleForm({ onRoleCreated }: CreateRoleFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [allClientRoles, setAllClientRoles] = useState<any[]>([]);
  const [loadingClientRoles, setLoadingClientRoles] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{
    name?: string;
    description?: string;
  }>({});
  const [isValidating, setIsValidating] = useState(false);

  const loadAllClientRoles = async () => {
    setLoadingClientRoles(true);
    try {
      // Get all clients first
      const clientsResponse = await getAllClients();
      const clients = clientsResponse.data;
      
      // Get all client roles from all clients
      const allRoles = [];
      for (const client of clients) {
        try {
          const clientRolesResponse = await getClientRoles(client.id);
          const clientRoles = clientRolesResponse.data.map((role: any) => ({
            ...role,
            clientId: client.id,
            clientName: client.clientId,
            clientDisplayName: client.name || client.clientId,
            clientType: client.clientId === 'account' ? 'Account Management' : 
                       client.clientId === 'realm-management' ? 'Realm Management' :
                       client.clientId === 'broker' ? 'Identity Broker' :
                       client.name || client.clientId,
          }));
          allRoles.push(...clientRoles);
        } catch (error) {
          console.warn(`Failed to load roles for client ${client.clientId}:`, error);
        }
      }
      
      setAllClientRoles(allRoles);
    } catch (error) {
      console.error('Error loading client roles:', error);
    } finally {
      setLoadingClientRoles(false);
    }
  };

  // Real-time validation function
  const validateField = async (field: 'name' | 'description', value: string) => {
    if (!value.trim()) {
      setValidationErrors(prev => ({ ...prev, [field]: undefined }));
      return;
    }

    // Skip validation if not ready
    if (field === 'name' && !isRoleNameReadyForValidation(value)) {
      setValidationErrors(prev => ({ ...prev, [field]: undefined }));
      return;
    }

    setIsValidating(true);
    try {
      const validation = validateRoleField(field, value);
      if (!validation.isValid) {
        setValidationErrors(prev => ({ ...prev, [field]: validation.error }));
      } else {
        setValidationErrors(prev => ({ ...prev, [field]: undefined }));
      }
    } finally {
      setIsValidating(false);
    }
  };

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: initialFormData,
    onSubmit: async (values, { resetForm }) => {
      const allValidation = validateAllRoleFields(values);
      if (!allValidation.isValid || validationErrors.name || validationErrors.description) {
        setValidationErrors(allValidation.errors);
        return;
      }

      setIsSubmitting(true);
      try {
        await createRole({
          name: values.name,
          description: values.description,
          type: 'realm',
          clientRoleIds: formik.values.clientRoleIds,
        });
        
        // Reset form and close dialog
        resetForm();
        setIsOpen(false);
        setValidationErrors({});
        onRoleCreated();
      } catch (error: any) {
        const errorMessage = error.response?.data?.error || error.message || "Failed to create role. Please try again.";
        alert(errorMessage);
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  // Load all client roles when dialog opens
  useEffect(() => {
    if (isOpen) {
      loadAllClientRoles();
    }
  }, [isOpen]);

  // Debounced validation for name
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (formik.values.name) {
        validateField('name', formik.values.name);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [formik.values.name]);

  // Debounced validation for description
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (formik.values.description) {
        validateField('description', formik.values.description);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [formik.values.description]);

  // Helper function to check if form is ready for submission
  const isFormReadyForSubmission = () => {
    const { name } = formik.values;
    
    // Check if all required fields have values
    const hasAllRequiredFields = name.trim() !== '';
    
    // Check if there are any validation errors
    const hasValidationErrors = validationErrors.name || validationErrors.description;
    
    return hasAllRequiredFields && !hasValidationErrors && !isValidating;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <span className="mr-2">+</span>
          Create Role
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Role</DialogTitle>
          <DialogDescription>
            Create a new realm role or client role in the system.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={formik.handleSubmit} className="space-y-4">
          {/* Only create realm roles for now */}
          <input type="hidden" name="type" value="realm" />

          <div className="space-y-2">
            <Label htmlFor="name">Role Name</Label>
            <Input
              id="name"
              name="name"
              value={formik.values.name}
              onChange={formik.handleChange}
              className={validationErrors.name ? "border-red-500" : ""}
              placeholder="Enter role name"
            />
            {validationErrors.name && (
              <p className="text-red-500 text-sm">{validationErrors.name}</p>
            )}
            {isValidating && formik.values.name && !validationErrors.name && (
              <p className="text-blue-500 text-sm">Validating...</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              name="description"
              value={formik.values.description}
              onChange={formik.handleChange}
              className={validationErrors.description ? "border-red-500" : ""}
              placeholder="Enter role description"
              rows={3}
            />
            {validationErrors.description && (
              <p className="text-red-500 text-sm">{validationErrors.description}</p>
            )}
          </div>

          {/* Client Role Assignment for Realm Roles */}
          <div className="space-y-3">
            <Label>Assign Client Roles (Optional)</Label>
            <p className="text-sm text-muted-foreground">
              Select client roles to assign to this realm role. This will give the realm role access to specific application features.
            </p>
            
            {/* Client Roles Selection */}
            <div className="space-y-2">
              <Label>Available Client Roles</Label>
              {loadingClientRoles ? (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  <span className="ml-2">Loading client roles...</span>
                </div>
              ) : allClientRoles.length > 0 ? (
                <div className="max-h-60 overflow-y-auto border rounded-md p-3 space-y-2">
                  {allClientRoles.map((clientRole) => {
                    const isSelected = formik.values.clientRoleIds?.includes(clientRole.id) || false;
                    return (
                      <div key={clientRole.id} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded">
                        <input
                          type="checkbox"
                          id={clientRole.id}
                          checked={isSelected}
                          onChange={(e) => {
                            const currentRoles = formik.values.clientRoleIds || [];
                            if (e.target.checked) {
                              formik.setFieldValue("clientRoleIds", [...currentRoles, clientRole.id]);
                            } else {
                              formik.setFieldValue("clientRoleIds", currentRoles.filter(id => id !== clientRole.id));
                            }
                          }}
                          className="rounded"
                        />
                        <div className="flex-1">
                          <Label htmlFor={clientRole.id} className="text-sm font-medium cursor-pointer">
                            {clientRole.name}
                          </Label>
                          <div className="text-xs text-muted-foreground">
                            From: {clientRole.clientType} ({clientRole.clientName})
                          </div>
                          {clientRole.description && (
                            <div className="text-xs text-muted-foreground mt-1">
                              {clientRole.description}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground text-sm">
                  No client roles found. Make sure you have client applications configured in Keycloak.
                </div>
              )}
            </div>

            {/* Selected Roles Summary */}
            {formik.values.clientRoleIds && formik.values.clientRoleIds.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Selected Client Roles ({formik.values.clientRoleIds.length})</Label>
                <div className="flex flex-wrap gap-1">
                  {formik.values.clientRoleIds.map((roleId) => {
                    const clientRole = allClientRoles.find(r => r.id === roleId);
                    return clientRole ? (
                      <span key={roleId} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {clientRole.name} ({clientRole.clientType})
                      </span>
                    ) : null;
                  })}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isSubmitting}>
                Cancel
              </Button>
            </DialogClose>
            <Button 
              type="submit" 
              disabled={isSubmitting || !isFormReadyForSubmission()}
            >
              {isSubmitting ? "Creating..." : "Create Role"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
