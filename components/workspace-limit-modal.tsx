'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface WorkspaceLimitModalProps {
  isOpen: boolean
  onClose: () => void
}

export function WorkspaceLimitModal({ isOpen, onClose }: WorkspaceLimitModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Workspace Limit Reached</DialogTitle>
          <DialogDescription>
            You have reached the maximum limit of 2 workspaces for a regular user. 
            To create more workspaces, please upgrade your account.
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
} 