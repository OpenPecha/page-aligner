import { AlertTriangle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface DeleteBlockDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  blockOrder: number
  onConfirm: () => void
}

/**
 * Confirmation dialog for deleting a transcription block.
 * Informs user that the action can be undone with Ctrl+Z.
 */
export function DeleteBlockDialog({
  open,
  onOpenChange,
  blockOrder,
  onConfirm,
}: DeleteBlockDialogProps) {
  const handleConfirm = () => {
    onConfirm()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Delete Block
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete transcription block <strong>#{blockOrder}</strong>? This
            action can be undone using Ctrl+Z.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleConfirm}>
            Delete Block
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
