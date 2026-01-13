import { useNavigate } from 'react-router-dom';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { LogIn, UserPlus } from 'lucide-react';

interface LoginRequiredDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  action?: string;
}

export function LoginRequiredDialog({ 
  open, 
  onOpenChange, 
  action = 'perform this action' 
}: LoginRequiredDialogProps) {
  const navigate = useNavigate();

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
            <LogIn className="h-6 w-6 text-primary" />
          </div>
          <AlertDialogTitle className="text-center">Login Required</AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            You need to be logged in to {action}. Create an account or sign in to continue.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogCancel className="sm:flex-1">Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={() => navigate('/login')}
            className="sm:flex-1 gap-2"
          >
            <UserPlus className="h-4 w-4" />
            Sign In / Sign Up
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}