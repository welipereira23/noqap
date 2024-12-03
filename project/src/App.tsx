import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { AuthProvider } from './providers/AuthProvider';
import { LoginPage } from './components/auth/LoginPage';
import { RegisterPage } from './components/auth/RegisterPage';
import { ForgotPasswordPage } from './components/auth/ForgotPasswordPage';
import { PrivateRoute } from './components/auth/PrivateRoute';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { MonthPage } from './components/month/MonthPage';
import { QuarterPage } from './components/quarter/QuarterPage';
import { SubscriptionPage } from './components/subscription/SubscriptionPage';
import { SuccessPage } from './components/subscription/SuccessPage';
import { CancelPage } from './components/subscription/CancelPage';
import { TrialBanner } from './components/subscription/TrialBanner';
import { useStore } from './store/useStore';
import { queryClient } from './lib/api';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </QueryClientProvider>
  );
}

function AppContent() {
  const user = useStore((state) => state.user);
  const subscription = useStore((state) => state.subscription);

  console.log('=== AppContent Debug ===');
  console.log('User:', user);
  console.log('Subscription:', subscription);
  console.log('Current Location:', window.location.pathname);

  const isInTrial = subscription?.status === 'trialing';
  const trialEnd = subscription?.trial_end ? new Date(subscription.trial_end * 1000) : null;
  const daysRemaining = trialEnd ? Math.ceil((trialEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 0;

  return (
    <div className="min-h-screen bg-gray-100">
      {user && isInTrial && daysRemaining > 0 && (
        <TrialBanner daysRemaining={daysRemaining} />
      )}
      <Toaster 
        position="top-right"
        expand={false}
        richColors
        closeButton
      />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/subscription/success" element={<SuccessPage />} />
        <Route path="/subscription/cancel" element={<CancelPage />} />
        <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="month/:year/:month" element={<MonthPage />} />
          <Route path="quarter/:year/:quarter" element={<QuarterPage />} />
          <Route path="subscription" element={<SubscriptionPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}

export default App;