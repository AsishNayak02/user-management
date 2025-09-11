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
import { deleteUser } from "@/api/userListing"
import { USER_ATTR } from "@/lib/utils.user"

interface DeleteUserDialogProps {
    user: USER_ATTR;
    onUserDeleted: () => void;
}

export function DeleteUserDialog({ user, onUserDeleted }: DeleteUserDialogProps) {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            const response = await deleteUser(user.id);
            if (response.status === 200) {
                onUserDeleted();
            } else {
                alert("Failed to delete user. Please try again.");
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.error || error.message || "Failed to delete user. Please try again.";
            alert(errorMessage);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600">
                    Delete User
                </DropdownMenuItem>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the user{" "}
                        <span className="font-semibold">{user.username}</span> from the system.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="bg-red-600 hover:bg-red-700"
                    >
                        {isDeleting ? "Deleting..." : "Delete User"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
