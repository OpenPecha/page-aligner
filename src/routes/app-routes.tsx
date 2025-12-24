import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AuthLayout, MainLayout } from '@/components/layout'
import { ProtectedRoute } from './protected-route'
import { UserRole } from '@/types'

// Pages
import { LoginPage } from '@/pages/auth/login-page'
import { CallbackPage } from '@/pages/auth/callback-page'
import { PendingApprovalPage } from '@/pages/auth/pending-approval-page'
import { DashboardPage } from '@/pages/dashboard-page'
import { AdminUsersPage } from '@/pages/admin/admin-users-page'
import { AdminTasksPage } from '@/pages/admin/admin-tasks-page'
import { AdminGroupsPage } from '@/pages/admin/admin-groups-page'
import { WorkspacePage } from '@/pages/workspace/workspace-page'
import { NotFoundPage } from '@/pages/not-found'

export const router = createBrowserRouter([
  // Auth routes (public)
  {
    element: <AuthLayout />,
    children: [
      {
        path: '/login',
        element: <LoginPage />,
      },
      {
        path: '/callback',
        element: <CallbackPage />,
      },
      {
        path: '/pending-approval',
        element: <PendingApprovalPage />,
      },
    ],
  },
  // Protected routes
  {
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: '/',
        element: <Navigate to="/workspace" replace />,
      },
      {
        path: '/dashboard',
        element: <DashboardPage />,
      },
      {
        path: '/admin/users',
        element: (
          <ProtectedRoute allowedRoles={[UserRole.Admin]}>
            <AdminUsersPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/admin/tasks',
        element: (
          <ProtectedRoute allowedRoles={[UserRole.Admin]}>
            <AdminTasksPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/admin/groups',
        element: (
          <ProtectedRoute allowedRoles={[UserRole.Admin]}>
            <AdminGroupsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/settings',
        element: (
          <div className="flex items-center justify-center h-[50vh]">
            <p className="text-muted-foreground">Settings page coming soon...</p>
          </div>
        ),
      },
    ],
  },

  // Workspace route (has its own layout)
  {
    path: '/workspace',
    element: (
      <ProtectedRoute allowedRoles={[UserRole.Annotator, UserRole.Reviewer, UserRole.FinalReviewer, UserRole.Admin]}>
        <WorkspacePage />
      </ProtectedRoute>
    ),
  },

  // 404
  {
    path: '*',
    element: <NotFoundPage />,
  },
])
