// src/App.tsx

import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './hooks/useAuth';
import ProtectedRoute from './components/auth/ProtectedRoute';
import PublicRoute from './components/auth/PublicRoute';
import Layout from './components/layout/Layout';
import LoadingPage from './pages/LoadingPage';
import EditJobPage from './pages/jobs/EditJobPage';

const PasswordResetPage = lazy(() => import('./pages/auth/PasswordResetPage'));
const ForgotPasswordRequestPage = lazy(() => import('./pages/auth/ForgotPasswordRequestPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const JobReportPage = lazy(() => import('./pages/jobs/JobReportPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const JobsPage = lazy(() => import('./pages/jobs/JobsPage'));
const JobDetailPage = lazy(() => import('./pages/jobs/JobDetailPage'));
const NewJobPage = lazy(() => import('./pages/jobs/NewJobPage'));
const ClientsPage = lazy(() => import('./pages/clients/ClientsPage'));
const ClientDetailPage = lazy(() => import('./pages/clients/ClientDetailPage'));
const NewClientPage = lazy(() => import('./pages/clients/NewClientPage'));
const TechniciansPage = lazy(() => import('./pages/technicians/TechniciansPage'));
const TechnicianFormPage = lazy(() => import('./pages/technicians/TechnicianFormPage'));
const TechnicianDetailPage = lazy(() => import('./pages/technicians/TechnicianDetailPage'));
const InvoicesPage = lazy(() => import('./pages/invoices/InvoicesPage'));
const InvoiceDetailPage = lazy(() => import('./pages/invoices/InvoiceDetailPage'));
const CreateInvoicePage = lazy(() => import('./pages/invoices/CreateInvoicePage'));
const PaymentsReportPage = lazy(() => import('./pages/ReportsPage'));
const SchedulePage = lazy(() => import('./pages/SchedulePage'));
const Sandbox = lazy(() => import('./pages/jobs/Sandbox'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const JobLookupPage = lazy(() => import('./pages/JobLookupPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

function AppRoutes() {
  return (
    <Routes>
      {/** — Always-public route for emailed links (no auth wrapper) — **/}
      <Route path="/job-report/:token" element={<JobReportPage />} />

      {/** — Guest-only routes — **/}
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/reset-password" element={<PasswordResetPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/job-lookup" element={<JobLookupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordRequestPage />} />
      </Route>

      {/** — Authenticated-only routes — **/}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/jobs" element={<JobsPage />} />
          <Route path="/jobs/:id/edit" element={<EditJobPage />} />
          <Route path="/jobs/new" element={<NewJobPage />} />
          <Route path="/jobs/:id" element={<JobDetailPage />} />
          <Route path="/clients" element={<ClientsPage />} />
          <Route path="/clients/new" element={<NewClientPage />} />
          <Route path="/clients/:id" element={<ClientDetailPage />} />
          <Route path="/technicians" element={<TechniciansPage />} />
          <Route path="/technicians/new" element={<TechnicianFormPage />} />
          <Route path="/technicians/:id/edit" element={<TechnicianFormPage edit={true} />} />
          <Route path="/technicians/:id" element={<TechnicianDetailPage />} />
          <Route path="/invoices" element={<InvoicesPage />} />
          <Route path="/invoices/:id" element={<InvoiceDetailPage />} />
          <Route path="/jobs/:jobId/invoice/new" element={<CreateInvoicePage />} />
          <Route path="/reports/payments" element={<PaymentsReportPage />} />
          <Route path="/schedule" element={<SchedulePage />} />
          <Route path="/sandbox" element={<Sandbox />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Route>

      {/** — Fallback — **/}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<LoadingPage />}>
          <AppRoutes />
        </Suspense>
        <Toaster position="top-right" />
      </BrowserRouter>
    </AuthProvider>
  );
}
