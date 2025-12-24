import { Navigate } from 'react-router-dom'
import { LoginForm, useAuth } from '@/features/auth'

export function LoginPage() {
  const { isAuthenticated, isLoading } = useAuth()

  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/46c965a1-fad8-474e-9dac-9305e8b48950',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'login-page.tsx:7',message:'LoginPage State',data:{isAuthenticated, isLoading},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'auth-race'})}).catch(()=>{});
  // #endregion

  // Show nothing while checking auth status
  if (isLoading) {
    return null
  }

  // Redirect if already logged in
  if (isAuthenticated) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/46c965a1-fad8-474e-9dac-9305e8b48950',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'login-page.tsx:16',message:'LoginPage Redirecting to dashboard',data:{isAuthenticated},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'auth-race'})}).catch(()=>{});
    // #endregion
    return <Navigate to="/dashboard" replace />
  }

  return <LoginForm />
}
