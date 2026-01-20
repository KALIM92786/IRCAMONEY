import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { TradeProvider } from './context/TradeContext';
import Layout from './components/Layout';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import OpenTrades from './pages/OpenTrades';
import TradeHistory from './pages/TradeHistory';
import EquityCurve from './pages/EquityCurve';
import CopyTrading from './pages/CopyTrading';
import Leaderboard from './pages/Leaderboard';
import ArchivedTrades from './pages/ArchivedTrades';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import Portfolio from './pages/Portfolio';
import NotFound from './pages/NotFound';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';
import TwoFactorAuth from './pages/TwoFactorAuth';
import RiskCalculator from './pages/RiskCalculator';
import SystemHealth from './pages/SystemHealth';
import UserManagement from './pages/UserManagement';
import SystemLogs from './pages/SystemLogs';
import DailyReports from './pages/DailyReports';
import Support from './pages/Support';
import StrategyPerformance from './pages/StrategyPerformance';
import TradingJournal from './pages/TradingJournal';

const ProtectedRoute = () => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-emerald-500">Loading...</div>;
  return user ? <Outlet /> : <Navigate to="/login" />;
};

const AdminRoute = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user && user.isAdmin ? <Outlet /> : <Navigate to="/dashboard" />;
};

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <TradeProvider>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />
              <Route path="/verify-email/:token" element={<VerifyEmail />} />

              {/* Protected Routes */}
              <Route element={<ProtectedRoute />}>
                <Route element={<Layout />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/trades" element={<OpenTrades />} />
                  <Route path="/history" element={<TradeHistory />} />
                  <Route path="/equity" element={<EquityCurve />} />
                  <Route path="/portfolio" element={<Portfolio />} />
                  <Route path="/copy-trading" element={<CopyTrading />} />
                  <Route path="/leaderboard" element={<Leaderboard />} />
                  <Route path="/archived" element={<ArchivedTrades />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/2fa" element={<TwoFactorAuth />} />
                  <Route path="/risk-calculator" element={<RiskCalculator />} />
                  <Route path="/reports/daily" element={<DailyReports />} />
                  <Route path="/support" element={<Support />} />
                  <Route path="/strategy" element={<StrategyPerformance />} />
                  <Route path="/journal" element={<TradingJournal />} />
                  
                  {/* Admin Routes */}
                  <Route element={<AdminRoute />}>
                    <Route path="/admin/users" element={<UserManagement />} />
                    <Route path="/admin/logs" element={<SystemLogs />} />
                    <Route path="/admin/health" element={<SystemHealth />} />
                  </Route>
                </Route>
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </TradeProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}