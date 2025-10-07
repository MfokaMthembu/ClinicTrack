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
import EditForm from './components/Dashboards/SysAdminDashboard/UserManagementPage/ManageUsers/UpdateForm';

import App from './App';

function AppRoutes() {
  return (
    <Router>
      <Routes>
         {/* index route */}
        <Route path="/" element={<App />} />
        <Route path="/editForm" element={ <EditForm />} />
        {/* Auth routes */}
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<Register />} />
        <Route path="/patient-register" element={<RegisterForm />} />
        <Route path="/staff-register" element={<StaffRegistrationForm />} />
        {/* Reset Password route */}

        {/* Admin Dashboard routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboardPage />} />
          <Route path="manage-users" element={<UserManagementPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="audit-logs" element={<AuditLogsPage />} />     
        </Route>
     
        {/* Patient Dashboard route */}
        <Route path="/patient" element={<PatientLayout />}>
            <Route index element={<PatientDashboardPage />} />
            <Route path="appointments" element={<AppointmentsPage />} />
            <Route path="ambulance" element={<AmbulancePage />} />
            <Route path="prescriptions" element={<PrescriptionsPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
          </Route>

        {/* Doctor Dashboard route */}
        <Route path="/doctor" element={<DoctorLayout />}>
            <Route index element={<DoctorDashboardPage />} />
            <Route path="availability" element={<AvailabilityPage />} />
            <Route path="approvals" element={<ApprovalPage />} />
            <Route path="consultation-notes" element={<ConsultationNotesPage />} />
            <Route path="on-call-schedule" element={<OnCallSchedulePage />} />
          </Route>
        
      </Routes>
    </Router>
  );
}

export default AppRoutes;
