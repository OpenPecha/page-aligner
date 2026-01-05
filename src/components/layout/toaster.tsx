import {
  Toast,
  ToastAction,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from '@/components/ui/toast'
import { useUIStore } from '@/store/use-ui-store'

export function Toaster() {
  const { toasts, removeToast } = useUIStore()

  return (
    <ToastProvider>
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          variant={toast.variant}
          onOpenChange={(open) => {
            if (!open) removeToast(toast.id)
          }}
        >
          <div className="grid gap-1">
            <ToastTitle>{toast.title}</ToastTitle>
            {toast.description && (
              <ToastDescription>{toast.description}</ToastDescription>
            )}
          </div>
          {toast.action && (
            <ToastAction
              altText={toast.action.label}
              onClick={() => {
                toast.action?.onClick()
                removeToast(toast.id)
              }}
            >
              {toast.action.label}
            </ToastAction>
          )}
          <ToastClose />
        </Toast>
      ))}
      <ToastViewport />
    </ToastProvider>
  )
}

