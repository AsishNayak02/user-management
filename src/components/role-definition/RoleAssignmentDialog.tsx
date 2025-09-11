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
import {
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { useFormik } from "formik"
import { useState, useEffect } from "react"
import { assignClientRoles, removeClientRoles, getAllClients, getClientRoles } from "@/api/roleManagement"
import { RoleDefinition, AssignClientRolesFormData } from "@/lib/types/role"

interface RoleAssignmentDialogProps {
  role: RoleDefinition;
  onAssignmentComplete: () => void;
}

export function RoleAssignmentDialog({ role, onAssignmentComplete }: RoleAssignmentDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [allClientRoles, setAllClientRoles] = useState<any[]>([]);
  const [loadingClientRoles, setLoadingClientRoles] = useState(false);

  const formik = useFormik<AssignClientRolesFormData>({
    enableReinitialize: true,
    initialValues: {
      realmRoleId: role.id,
      clientRoleIds: role.assignedClientRoles?.map(r => r.id) || [],
    },
    onSubmit: async (values) => {
      setIsSubmitting(true);
      try {
        // Get current assignments
        const currentAssignments = role.assignedClientRoles?.map(r => r.id) || [];
        
        // Find roles to add and remove
        const rolesToAdd = values.clientRoleIds.filter(id => !currentAssignments.includes(id));
        const rolesToRemove = currentAssignments.filter(id => !values.clientRoleIds.includes(id));

        // Add new assignments
        if (rolesToAdd.length > 0) {
          await assignClientRoles(role.id, rolesToAdd);
        }

        // Remove old assignments
        if (rolesToRemove.length > 0) {
          await removeClientRoles(role.id, rolesToRemove);
        }

        setIsOpen(false);
        onAssignmentComplete();
      } catch (error: any) {
        const errorMessage = error.response?.data?.error || error.message || "Failed to update role assignments. Please try again.";
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

  const handleRoleToggle = (roleId: string, checked: boolean) => {
    const currentRoles = formik.values.clientRoleIds;
    if (checked) {
      formik.setFieldValue("clientRoleIds", [...currentRoles, roleId]);
    } else {
      formik.setFieldValue("clientRoleIds", currentRoles.filter(id => id !== roleId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allRoleIds = allClientRoles.map(role => role.id);
      formik.setFieldValue("clientRoleIds", allRoleIds);
    } else {
      formik.setFieldValue("clientRoleIds", []);
    }
  };

  const isAllSelected = allClientRoles.length > 0 && 
    allClientRoles.every(role => formik.values.clientRoleIds.includes(role.id));

  const isIndeterminate = allClientRoles.some(role => formik.values.clientRoleIds.includes(role.id)) && !isAllSelected;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
          <span className="mr-2">👥</span>
          Manage Client Roles
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Manage Client Role Assignments</DialogTitle>
          <DialogDescription>
            Assign or remove client roles for the realm role: <strong>{role.name}</strong>
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={formik.handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto space-y-4">
            {/* Client Roles Selection */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Available Client Roles</Label>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="select-all"
                    checked={isAllSelected}
                    onCheckedChange={handleSelectAll}
                  />
                  <Label htmlFor="select-all" className="text-sm">
                    Select All
                  </Label>
                </div>
              </div>

              {loadingClientRoles ? (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  <span className="ml-2">Loading client roles...</span>
                </div>
              ) : allClientRoles.length > 0 ? (
                <div className="max-h-60 overflow-y-auto border rounded-md p-3 space-y-2">
                  {allClientRoles.map((clientRole) => {
                    const isSelected = formik.values.clientRoleIds.includes(clientRole.id);
                    return (
                      <div key={clientRole.id} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded">
                        <Checkbox
                          id={clientRole.id}
                          checked={isSelected}
                          onCheckedChange={(checked) => handleRoleToggle(clientRole.id, checked as boolean)}
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
                <div className="text-center py-4 text-muted-foreground">
                  No client roles found. Make sure you have client applications configured in Keycloak.
                </div>
              )}
            </div>

            {/* Current Assignments Summary */}
            {formik.values.clientRoleIds.length > 0 && (
              <div className="space-y-2">
                <Label>Selected Roles ({formik.values.clientRoleIds.length})</Label>
                <div className="flex flex-wrap gap-1">
                  {formik.values.clientRoleIds.map((roleId) => {
                    const clientRole = allClientRoles.find(r => r.id === roleId);
                    return clientRole ? (
                      <Badge key={roleId} variant="secondary" className="text-xs">
                        {clientRole.name} ({clientRole.clientType})
                      </Badge>
                    ) : null;
                  })}
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="mt-4">
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isSubmitting}>
                Cancel
              </Button>
            </DialogClose>
            <Button 
              type="submit" 
              disabled={isSubmitting}
            >
              {isSubmitting ? "Updating..." : "Update Assignments"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
