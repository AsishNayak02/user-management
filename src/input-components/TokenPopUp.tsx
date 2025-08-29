import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { useTokenRefresh } from "../hooks/useTokenRefresh";

export function TokenPopUp() {
    const { showDialog, timeLeft, refreshToken, dismiss } = useTokenRefresh();
  return (
    <AlertDialog open={showDialog} onOpenChange={dismiss}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Session Expiring Soon</AlertDialogTitle>
          <AlertDialogDescription>
            Your session will expire in <b>{timeLeft}s</b>. Do you want to continue?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex gap-2 justify-end">
          <AlertDialogCancel onClick={dismiss}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={refreshToken}>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
