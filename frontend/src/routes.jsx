import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginForm from './components/AuthService/Login/LoginForm';
import Register from './components/AuthService/Registration/Register';
import RegisterForm from './components/AuthService/Registration/UserRegistration/UserRegistrationForm';
import StaffRegistrationForm from './components/AuthService/Registration/StaffRegistration/StaffRegistration';
import AdminLayout from './components/Layouts/AdminLayout/AdminLayout';
import AdminDashboardPage from './components/Dashboards/SysAdminDashboard/DashboardPage/AdminDashboardPage';
import UserManagementPage from './components/Dashboards/SysAdminDashboard/UserManagementPage/UserManagementPage';
import ReportsPage from './components/Dashboards/SysAdminDashboard/ReportingPage/ReportsPage';
import AuditLogsPage from './components/Dashboards/SysAdminDashboard/AuditLogsPage/AuditLogsPage';
import PatientLayout from './components/Layouts/PatientLayout/PatientLayout';
import PatientDashboardPage from './components/Dashboards/PatientDashboard/DashboardPage/PatientDashboardPage';
import AppointmentsPage from './components/Dashboards/PatientDashboard/AppointmentsPage/AppointmentsPage';
import AmbulancePage from './components/Dashboards/PatientDashboard/AmbulancePage/AmbulancePage';
import NotificationsPage from './components/Dashboards/PatientDashboard/NotificationsPage/NotificationsPage';
import PrescriptionsPage from './components/Dashboards/PatientDashboard/PrescriptionsPage/PrescriptionsPage';
import DoctorLayout from './components/Layouts/DoctorLayout/DoctorLayout';
import DoctorDashboardPage from './components/Dashboards/DoctorsDashboard/DashboardPage/DoctorsDashboard';
import ApprovalPage from './components/Dashboards/DoctorsDashboard/ApprovalsPage/ApprovalPage';
import AvailabilityPage from './components/Dashboards/DoctorsDashboard/AvailabilityPage/AvailabilityPage';
import ConsultationNotesPage from './components/Dashboards/DoctorsDashboard/ConsulationNotesPage/ConsultationPage';
import OnCallSchedulePage from './components/Dashboards/DoctorsDashboard/OnCallSchedulePage/OnCallSchedulePage';
import PharmacyLayout from './components/Layouts/PharmacyLayout/PharmacyLayout';
import PharmacyDashboard from './components/Dashboards/PharmacyDashboard/DashboardPage/PharmacyDashboard';
import InventoryPage from './components/Dashboards/PharmacyDashboard/InventoryPage/InventoryPage';
import DispensaryPage from './components/Dashboards/PharmacyDashboard/DispensaryPage/DispensaryPage';
import StockAlertsPage from './components/Dashboards/PharmacyDashboard/StockAlertsPage/StockAlerts';
import ReportingPage from './components/Dashboards/PharmacyDashboard/ReportingPage/ReportingPage';
import DriverLayout from './components/Layouts/DriverLayout/DriverLayout';
import DriverDashboard from './components/Dashboards/DriverDashboard/DashboardPage/AmbulanceDriverDashboard';
import DriverRequests from './components/Dashboards/DriverDashboard/ApproveRequestPage/ApproveRequest';
import DriverLocation from './components/Dashboards/DriverDashboard/LocationPage/LocationPage';
import ForgotPassword from './components/AuthService/ForgotPassword/ForgotPasswordForm';

import App from './App';

function AppRoutes() {
  return (
    <Router>
      <Routes>
         {/* index route */}
        <Route path="/" element={<App />} />
        
        {/* Auth routes */}
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<Register />} />
        <Route path="/patient-register" element={<RegisterForm />} />
        <Route path="/staff-register" element={<StaffRegistrationForm />} />
        
        {/* Reset Password route */}
        <Route path="/forgot-password" element={<ForgotPassword />} />
        
        {/* Admin Dashboard routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboardPage />} />
          <Route path="manage-users" element={<UserManagementPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="audit-logs" element={<AuditLogsPage />} />    
        </Route>
     
        {/* Patient Dashboard routes */}
        <Route path="/patient" element={<PatientLayout />}>
            <Route index element={<PatientDashboardPage />} />
            <Route path="appointments" element={<AppointmentsPage />} />
            <Route path="ambulance" element={<AmbulancePage />} />
            <Route path="prescriptions" element={<PrescriptionsPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
          </Route>

        {/* Doctor Dashboard routes */}
        <Route path="/doctor" element={<DoctorLayout />}>
            <Route index element={<DoctorDashboardPage />} />
            <Route path="availability" element={<AvailabilityPage />} />
            <Route path="approvals" element={<ApprovalPage />} />
            <Route path="consultation-notes" element={<ConsultationNotesPage />} />
            <Route path="on-call-schedule" element={<OnCallSchedulePage />} />
          </Route>

          {/* Pharmacy Dashboard routes */}
          <Route path="/pharmacist" element={<PharmacyLayout />}>
              <Route index element={<PharmacyDashboard />} />
              <Route path="inventory" element={<InventoryPage />} />
              <Route path="dispensary" element={<DispensaryPage />} />
              <Route path="lowstock" element={<StockAlertsPage />} />
              <Route path="reporting" element={<ReportingPage />} />
            </Route>

          {/* Pharmacy Dashboard routes */}
          <Route path="/ambulance" element={<DriverLayout />}>
              <Route index element={<DriverDashboard />} />
              <Route path="requests" element={<DriverRequests />} />
              <Route path="share-location" element={<DriverLocation />} />
          </Route>
          
      </Routes>
    </Router>
  );
}

export default AppRoutes;
