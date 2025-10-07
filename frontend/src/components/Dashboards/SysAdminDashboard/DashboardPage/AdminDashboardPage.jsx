import './AdminDashboard.css';
import '../../../Layouts/AdminLayout/AdminLayout.css';

export default function AdminDashboardPage() {
  return (
    <div className="admin-dashboard">
      <h1 className="page-title">Medical Dashboard</h1>
      <p className="page-subtitle">
        Welcome to Makoanyane Military Hospital Management System
      </p>

        <div className="dashboard-cards">
          <div className="card stat-card">
            <div className="stat-value"> </div>
            <div className="stat-label">Active Patients</div>
          </div>

          <div className="card stat-card">
            <div className="stat-value"> </div>
            <div className="stat-label">Today's Appointments</div>
          </div>

          <div className="card stat-card">
            <div className="stat-value"> </div>
            <div className="stat-label">Emergency Cases</div>
          </div>

          <div className="card stat-card">
            <div className="stat-value"> </div>
            <div className="stat-label">Available Beds</div>
          </div>
        </div>

        <div className="dashboard-cards">
          <div className="card">
            <h3 style={{ color: "#2d5a27", marginBottom: "15px" }}>
              Recent Activity
            </h3>
            <p>No recent activities available.
            </p>
          </div>

          <div className="card">
            <h3 style={{ color: "#2d5a27", marginBottom: "15px" }}>
              Quick Actions
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <button className="btn btn-green">Add New Patient</button>
              <button className="btn btn-red">Emergency Alert</button>
              <button className="btn btn-lightgreen">Schedule Appointment</button>
            </div>
          </div>
        </div>
    </div>
  );
}

