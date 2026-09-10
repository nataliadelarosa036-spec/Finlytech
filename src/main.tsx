import React from 'react';
import ReactDOM from 'react-dom/client';
import './i18n';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import { Layout } from '@/components/Layout';
import { AuthGuard } from '@/components/AuthGuard';
import { useAuthStore } from '@/state/authStore';

// Public pages
import { LandingPage } from '@/pages/LandingPage';
import { FeaturesPage } from '@/pages/FeaturesPage';
import { PlansPage } from '@/pages/PlansPage';
import { FAQPage } from '@/pages/FAQPage';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { ForgotPasswordPage } from '@/pages/ForgotPasswordPage';
import { ResetPasswordPage } from '@/pages/ResetPasswordPage';
import { VerifyEmailPage } from '@/pages/VerifyEmailPage';
import { PrivacyPage } from '@/pages/PrivacyPage';
import { TermsPage } from '@/pages/TermsPage';
import { ContactPage } from '@/pages/ContactPage';

// App pages (con layout)
import { HomePage } from '@/pages/HomePage';
import { MoneyPage } from '@/pages/MoneyPage';
import { WealthPage } from '@/pages/WealthPage';
import { InsightsPage } from '@/pages/InsightsPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { NotFoundPage } from '@/pages/NotFoundPage';

function RootRoute() {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? (
    <Layout>
      <HomePage />
    </Layout>
  ) : (
    <LandingPage />
  );
}



ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <I18nextProvider i18n={i18n}>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AuthGuard>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<RootRoute />} />
            <Route path="/landing" element={<LandingPage />} />
            <Route path="/features" element={<FeaturesPage />} />
            <Route path="/plans" element={<PlansPage />} />
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/contact" element={<ContactPage />} />
            {/* Private routes */}
            <Route
              path="/money"
              element={
                <Layout>
                  <MoneyPage />
                </Layout>
              }
            />
            <Route
              path="/money/:tab"
              element={
                <Layout>
                  <MoneyPage />
                </Layout>
              }
            />
            <Route
              path="/wealth"
              element={
                <Layout>
                  <WealthPage />
                </Layout>
              }
            />
            <Route
              path="/wealth/:tab"
              element={
                <Layout>
                  <WealthPage />
                </Layout>
              }
            />
            <Route
              path="/insights"
              element={
                <Layout>
                  <InsightsPage />
                </Layout>
              }
            />
            <Route
              path="/insights/:tab"
              element={
                <Layout>
                  <InsightsPage />
                </Layout>
              }
            />
            <Route
              path="/profile"
              element={
                <Layout>
                  <ProfilePage />
                </Layout>
              }
            />
            {/* 404 */}
            <Route
              path="*"
              element={
                <Layout>
                  <NotFoundPage />
                </Layout>
              }
            />
          </Routes>
        </AuthGuard>
      </BrowserRouter>
    </I18nextProvider>
  </React.StrictMode>
);
