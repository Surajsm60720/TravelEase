import { Suspense } from "react";
import { useRoutes, Routes, Route, Navigate } from "react-router-dom";
import Home from "./components/home";
import DirectionsPage from "./components/directions";
import TripsPage from "./components/trips/TripsPage";
import Navbar from "./components/navbar";
import { ThemeProvider } from "./components/theme-provider";
import { AuthProvider, useAuth } from "./contexts/auth-context";
import SignInPage from "./pages/auth/signin";
import SignUpPage from "./pages/auth/signup";
import VerifyEmailPage from "./pages/auth/verify-email";
import AuthCallback from "./pages/auth/callback";
import routes from "tempo-routes";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session } = useAuth();

  if (!session) {
    return <Navigate to="/auth/signin" replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="app-theme">
      <AuthProvider>
        <Suspense fallback={<p>Loading...</p>}>
          <>
            <Navbar />
            <Routes>
              {/* Auth Routes */}
              <Route path="/auth/signin" element={<SignInPage />} />
              <Route path="/auth/signup" element={<SignUpPage />} />
              <Route path="/auth/verify-email" element={<VerifyEmailPage />} />
              <Route path="/auth/callback" element={<AuthCallback />} />

              {/* Public Routes */}
              <Route path="/" element={<Home />} />

              {/* Protected Routes */}
              <Route
                path="/trips"
                element={
                  <ProtectedRoute>
                    <TripsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/directions"
                element={
                  <ProtectedRoute>
                    <DirectionsPage />
                  </ProtectedRoute>
                }
              />
            </Routes>
            {import.meta.env.VITE_TEMPO === "true" && useRoutes(routes)}
          </>
        </Suspense>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
