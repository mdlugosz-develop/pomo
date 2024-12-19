import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Clock } from "lucide-react"

interface ComingSoonDialogProps {
  isOpen: boolean
  onClose: () => void
}

export function ComingSoonDialog({ isOpen, onClose }: ComingSoonDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Coming Soon
          </DialogTitle>
        </DialogHeader>
        <div className="py-6">
          <p className="text-gray-600 text-center">
            Sign ups are temporarily disabled while we prepare for launch. 
            Check back soon!
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
} 