import { Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { AuthProvider } from './providers/AuthProvider';
import { LoginPage } from './components/auth/LoginPage';
import { RegisterPage } from './components/auth/RegisterPage';
import { ForgotPasswordPage } from './components/auth/ForgotPasswordPage';
import { AccessPage } from './components/auth/AccessPage';
import { PrivateRoute } from './components/auth/PrivateRoute';
import { AdminRoute } from './components/auth/AdminRoute';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { MonthPage } from './components/month/MonthPage';
import { UserList } from './components/admin/UserList';
import { queryClient } from './lib/api';
import AuthCallback from './components/auth/AuthCallback';
import { GoogleScriptLoader } from './components/GoogleScriptLoader';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';

function App() {
  return (
    <>
      <GoogleScriptLoader />
      <Toaster position="top-right" />
      <PWAInstallPrompt />
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/auth/callback" element={<AuthCallback />} />

            {/* Protected Routes */}
            <Route element={<PrivateRoute />}>
              <Route path="/access" element={<AccessPage />} />
              <Route element={<Layout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/month/:year/:month" element={<MonthPage />} />
                
                {/* Admin Routes */}
                <Route element={<AdminRoute />}>
                  <Route path="/admin" element={<UserList />} />
                </Route>
              </Route>
            </Route>

            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </AuthProvider>
      </QueryClientProvider>
    </>
  );
}

export default App;