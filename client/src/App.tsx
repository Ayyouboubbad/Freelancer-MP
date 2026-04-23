import React, { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { I18nProvider } from './i18n';
import { SocketProvider } from './context/SocketContext';
import { useAuthStore } from './store/authStore';
import { useNotificationStore } from './store/notificationStore';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './components/AdminLayout';

// Lazy-loaded pages
const HomePage              = lazy(() => import('./pages/HomePage'));
const LoginPage             = lazy(() => import('./pages/LoginPage'));
const RegisterPage          = lazy(() => import('./pages/RegisterPage'));
const GigDetailPage         = lazy(() => import('./pages/GigDetailPage'));
const SearchPage            = lazy(() => import('./pages/SearchPage'));
const ClientDashboard       = lazy(() => import('./pages/ClientDashboard'));
const FreelancerDashboard   = lazy(() => import('./pages/FreelancerDashboard'));
const NotificationsPage     = lazy(() => import('./pages/NotificationsPage'));
const ProfilePage           = lazy(() => import('./pages/ProfilePage'));
const SettingsPage          = lazy(() => import('./pages/SettingsPage'));
const OrderDetailPage       = lazy(() => import('./pages/OrderDetailPage'));
const MessagesPage          = lazy(() => import('./pages/MessagesPage'));
const GigFormPage           = lazy(() => import('./pages/GigFormPage'));

// Admin sub-pages
const AdminOverview  = lazy(() => import('./pages/admin/AdminOverview'));
const AdminUsers     = lazy(() => import('./pages/admin/AdminUsers'));
const AdminGigs      = lazy(() => import('./pages/admin/AdminGigs'));
const AdminDisputes  = lazy(() => import('./pages/admin/AdminDisputes'));
const NotFoundPage   = lazy(() => import('./pages/NotFoundPage'));

// Page loader fallback
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[50vh]">
    <div className="flex flex-col items-center gap-4">
      <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
      <span className="text-slate-400 text-sm">Loading...</span>
    </div>
  </div>
);


const App = () => {
  const { fetchMe } = useAuthStore();
  const { fetch: fetchNotifs } = useNotificationStore();

  useEffect(() => {
    fetchMe().then(() => {
      const { user } = useAuthStore.getState();
      if (user) fetchNotifs();
    });
  }, []);

  return (
    <I18nProvider>
      <SocketProvider>
        <BrowserRouter>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1">
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  {/* Public */}
                  <Route path="/"          element={<HomePage />} />
                  <Route path="/login"     element={<LoginPage />} />
                  <Route path="/register"  element={<RegisterPage />} />
                  <Route path="/gig/:id"   element={<GigDetailPage />} />
                  <Route path="/search"    element={<SearchPage />} />
                  <Route path="/profile/:id" element={<ProfilePage />} />

                  {/* Auth-required */}
                  <Route element={<ProtectedRoute />}>
                    <Route path="/notifications" element={<NotificationsPage />} />
                    <Route path="/settings"      element={<SettingsPage />} />
                    <Route path="/messages"                 element={<MessagesPage />} />
                    <Route path="/messages/:conversationId" element={<MessagesPage />} />
                  </Route>

                  {/* Client */}
                  <Route element={<ProtectedRoute roles={['client']} />}>
                    <Route path="/dashboard/client"              element={<ClientDashboard />} />
                    <Route path="/dashboard/client/orders"       element={<ClientDashboard />} />
                    <Route path="/dashboard/client/orders/:id"   element={<OrderDetailPage />} />
                  </Route>

                  {/* Freelancer */}
                  <Route element={<ProtectedRoute roles={['freelancer']} />}>
                    <Route path="/dashboard/freelancer"              element={<FreelancerDashboard />} />
                    <Route path="/dashboard/freelancer/gigs"         element={<FreelancerDashboard />} />
                    <Route path="/dashboard/freelancer/gigs/new"     element={<GigFormPage />} />
                    <Route path="/dashboard/freelancer/gigs/:id/edit" element={<GigFormPage />} />
                    <Route path="/dashboard/freelancer/orders/:id"   element={<OrderDetailPage />} />
                  </Route>

                  {/* Admin — layout with nested sub-pages */}
                  <Route element={<ProtectedRoute roles={['admin']} />}>
                    <Route element={<AdminLayout />}>
                      <Route path="/admin"           element={<AdminOverview />} />
                      <Route path="/admin/users"     element={<AdminUsers />} />
                      <Route path="/admin/gigs"      element={<AdminGigs />} />
                      <Route path="/admin/disputes"  element={<AdminDisputes />} />
                      <Route path="/admin/analytics" element={<AdminOverview />} />
                    </Route>
                  </Route>

                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </Suspense>
            </main>
            <Footer />
          </div>

          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#1c1c38',
                color: '#f1f5f9',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
              },
              success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
              error:   { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
            }}
          />
        </BrowserRouter>
      </SocketProvider>
    </I18nProvider>
  );
};

export default App;
