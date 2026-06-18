import { lazy, Suspense } from "react"
import { Routes, Route, Navigate } from "react-router-dom"
import { useAuthStore } from "./stores/auth-store"

// The public landing page is the cold-visitor entry point, so it stays eager —
// its first paint must not wait on a lazy chunk. Everything else is code-split
// so a visitor to "/" no longer downloads the entire authenticated app.
import LandingPage from "./pages/landing"

// Layouts
const AppShell = lazy(() => import("./components/layout/app-shell"))
const AuthLayout = lazy(() => import("./components/layout/auth-layout"))

// Pages
const LoginPage = lazy(() => import("./pages/auth/login"))
const SignupPage = lazy(() => import("./pages/auth/signup"))
const ForgotPasswordPage = lazy(() => import("./pages/auth/forgot-password"))
const DashboardPage = lazy(() => import("./pages/dashboard"))
const CataloguePage = lazy(() => import("./pages/catalogue"))
const ResourceDetailPage = lazy(() => import("./pages/resource-detail"))
const MyResourcesPage = lazy(() => import("./pages/my-resources"))
const BorrowingPage = lazy(() => import("./pages/borrowing"))
const CartPage = lazy(() => import("./pages/cart"))
const MessagesPage = lazy(() => import("./pages/messages"))
const ProfilePage = lazy(() => import("./pages/profile"))
const NotificationsPage = lazy(() => import("./pages/notifications"))
const SettingsPage = lazy(() => import("./pages/settings"))

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

function PublicOnlyRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}

// Neutral, layout-stable fallback shown only while a route chunk loads.
function RouteFallback() {
  return <div className="min-h-screen bg-[var(--bg-base)]" aria-hidden />
}

export default function App() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        {/* Public landing page */}
        <Route path="/" element={<LandingPage />} />

        {/* Auth routes */}
        <Route element={<PublicOnlyRoute><AuthLayout /></PublicOnlyRoute>}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        </Route>

        {/* Protected app routes */}
        <Route element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/catalogue" element={<CataloguePage />} />
          <Route path="/resource/:id" element={<ResourceDetailPage />} />
          <Route path="/my-resources" element={<MyResourcesPage />} />
          <Route path="/borrowing" element={<BorrowingPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/messages" element={<MessagesPage />} />
          <Route path="/messages/:conversationId" element={<MessagesPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}
