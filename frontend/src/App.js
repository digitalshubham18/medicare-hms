import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout/Layout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import AppointmentsPage from './pages/AppointmentsPage';
import PatientsPage from './pages/PatientsPage';
import DoctorsPage from './pages/DoctorsPage';
import PharmacyPage from './pages/PharmacyPage';
import OrdersPage from './pages/OrdersPage';
import RecordsPage from './pages/RecordsPage';
import RemindersPage from './pages/RemindersPage';
import EmergencyPage from './pages/EmergencyPage';
import SymptomCheckerPage from './pages/SymptomCheckerPage';
import AnalyticsPage from './pages/AnalyticsPage';
import UserApprovalPage from './pages/UserApprovalPage';
import PrescriptionsPage from './pages/PrescriptionsPage';
import SettingsPage from './pages/SettingsPage';
import ChatPage from './pages/ChatPage';
import RoomsPage from './pages/RoomsPage';
import SupportStaffDashboard from './pages/SupportStaffDashboard';
import NoticeBoardPage from './pages/NoticeBoardPage';
import LeavePage from './pages/LeavePage';
import MyTimetablePage from './pages/MyTimetablePage';
import SalaryPage from './pages/SalaryPage';
import FinanceDashboard from './pages/FinanceDashboard';
import AdminTimetablePage from './pages/AdminTimetablePage';
import MaintenanceDashboard from './pages/MaintenanceDashboard';
import MaintenanceAdminPage from './pages/MaintenanceAdminPage';
import './assets/styles/global.css';

const MAINTENANCE_ROLES = ['electrician','plumber','it_technician','equipment_tech','biomedical','security','receptionist','ambulance_driver','sweeper'];
const ALL_STAFF = ['doctor','nurse','pharmacist','wardboy','sweeper','otboy','finance',...MAINTENANCE_ROLES];

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading, isAuthenticated } = useAuth();
  if (loading) return (
    <div className="app-loading">
      <div style={{textAlign:'center'}}>
        <div className="spinner-lg"/>
        <p style={{color:'#94a3b8',fontSize:14,marginTop:12}}>Loading MediCare HMS…</p>
      </div>
    </div>
  );
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user?.role)) return <Navigate to="/dashboard" replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="app-loading"><div className="spinner-lg"/></div>;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />}/>
      <Route path="/login"    element={<PublicRoute><LoginPage /></PublicRoute>}/>
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>}/>
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>

        {/* ── Universal ── */}
        <Route path="dashboard"    element={<Dashboard />}/>
        <Route path="settings"     element={<SettingsPage />}/>
        <Route path="notice-board" element={<NoticeBoardPage />}/>
        <Route path="leaves"       element={<LeavePage />}/>
        <Route path="my-timetable" element={<MyTimetablePage />}/>
        <Route path="reminders"    element={<RemindersPage />}/>
        <Route path="emergency"    element={<EmergencyPage />}/>
        <Route path="symptom-checker" element={<SymptomCheckerPage />}/>

        {/* ── Staff only ── */}
        <Route path="salary"  element={<ProtectedRoute roles={['admin',...ALL_STAFF]}><SalaryPage /></ProtectedRoute>}/>
        <Route path="chat"    element={<ProtectedRoute roles={['admin',...ALL_STAFF]}><ChatPage /></ProtectedRoute>}/>

        {/* ── Clinical ── */}
        <Route path="appointments" element={<AppointmentsPage />}/>
        <Route path="patients"  element={<ProtectedRoute roles={['admin','doctor','nurse','receptionist']}><PatientsPage /></ProtectedRoute>}/>
        <Route path="doctors"   element={<ProtectedRoute roles={['admin']}><DoctorsPage /></ProtectedRoute>}/>
        <Route path="pharmacy"  element={<PharmacyPage />}/>
        <Route path="orders"    element={<OrdersPage />}/>
        <Route path="records"   element={<RecordsPage />}/>
        <Route path="analytics" element={<ProtectedRoute roles={['admin','doctor']}><AnalyticsPage /></ProtectedRoute>}/>
        <Route path="user-approval" element={<ProtectedRoute roles={['admin']}><UserApprovalPage /></ProtectedRoute>}/>
        <Route path="prescriptions" element={<ProtectedRoute roles={['doctor','admin']}><PrescriptionsPage /></ProtectedRoute>}/>
        <Route path="rooms" element={<ProtectedRoute roles={['admin','doctor','nurse','wardboy','pharmacist','receptionist']}><RoomsPage /></ProtectedRoute>}/>

        {/* ── Support staff ── */}
        <Route path="staff-dashboard" element={<ProtectedRoute roles={['wardboy','otboy']}><SupportStaffDashboard /></ProtectedRoute>}/>

        {/* ── Maintenance specialists ── */}
        <Route path="maintenance-dashboard" element={<ProtectedRoute roles={MAINTENANCE_ROLES}><MaintenanceDashboard /></ProtectedRoute>}/>

        {/* ── Admin-only ── */}
        <Route path="maintenance-admin" element={<ProtectedRoute roles={['admin']}><MaintenanceAdminPage /></ProtectedRoute>}/>
        <Route path="admin-timetable"   element={<ProtectedRoute roles={['admin']}><AdminTimetablePage /></ProtectedRoute>}/>
        <Route path="finance" element={<ProtectedRoute roles={['finance','admin']}><FinanceDashboard /></ProtectedRoute>}/>

      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />}/>
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster position="top-right" toastOptions={{duration:4000,style:{borderRadius:'10px',fontSize:'13.5px',fontWeight:'500',fontFamily:"'Inter',system-ui,sans-serif"},success:{iconTheme:{primary:'#059669',secondary:'#fff'}},error:{iconTheme:{primary:'#dc2626',secondary:'#fff'}}}}/>
      </AuthProvider>
    </BrowserRouter>
  );
}
