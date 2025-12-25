import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/features/auth'
import { LoadingSpinner } from '@/components/common'
import type { UserRole } from '@/types'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: UserRole[]
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { currentUser, isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/46c965a1-fad8-474e-9dac-9305e8b48950',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'protected-route.tsx:16',message:'ProtectedRoute Check',data:{isAuthenticated, isLoading, currentUser, allowedRoles, path: location.pathname},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'auth-race'})}).catch(()=>{});
  // #endregion

  // Show loading while checking auth state
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  // Not authenticated - redirect to login
  if (!isAuthenticated || !currentUser) {
     // #region agent log
     fetch('http://127.0.0.1:7242/ingest/46c965a1-fad8-474e-9dac-9305e8b48950',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'protected-route.tsx:28',message:'Redirecting to login',data:{isAuthenticated, currentUser},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'auth-race'})}).catch(()=>{});
     // #endregion
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // User has no role assigned - redirect to pending approval
  if (!currentUser.role) {
    return <Navigate to="/pending-approval" replace />
  }

  // Check role-based access
  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    // Redirect to their default dashboard
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/46c965a1-fad8-474e-9dac-9305e8b48950',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'protected-route.tsx:35',message:'Redirecting to dashboard (role)',data:{userRole: currentUser.role, allowedRoles},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'auth-race'})}).catch(()=>{});
    // #endregion
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}
