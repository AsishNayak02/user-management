"use client"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { useState } from "react"
import { deleteRole } from "@/api/roleManagement"
import { RoleDefinition } from "@/lib/types/role"

interface DeleteRoleDialogProps {
  role: RoleDefinition;
  onRoleDeleted: (roleId: string) => void;
}

export function DeleteRoleDialog({ role, onRoleDeleted }: DeleteRoleDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteRole(role.id);
      onRoleDeleted(role.id);
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || "Failed to delete role. Please try again.";
      alert(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600">
          <span className="mr-2">🗑️</span>
          Delete Role
        </DropdownMenuItem>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the role{" "}
            <span className="font-semibold">{role.name}</span> from the system.
          </AlertDialogDescription>
          {role.assignedClientRoles && role.assignedClientRoles.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium text-muted-foreground mb-2">
                This will also remove all client role assignments:
              </p>
              <div className="flex flex-wrap gap-1">
                {role.assignedClientRoles.slice(0, 5).map((clientRole, index) => (
                  <span key={index} className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                    {clientRole.name}
                  </span>
                ))}
                {role.assignedClientRoles.length > 5 && (
                  <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                    +{role.assignedClientRoles.length - 5} more
                  </span>
                )}
              </div>
            </div>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700"
          >
            {isDeleting ? "Deleting..." : "Delete Role"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
