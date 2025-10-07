import './DoctorsDashboard.css';
import '../../../Layouts/DoctorLayout/DoctorLayout.css';

export default function DoctorsDashboard() {
  return (
    <div className="doctor-dashboard">
      <div className="content-header">
        <h1 className="page-title">Medical Dashboard</h1>
        <p className="page-subtitle">
          Welcome to Makoanyane Military Hospital Management System
        </p>
      </div>

      <div className="dashboard-cards">
        <div className="card stat-card">
          <div className="stat-value"></div>
          <div className="stat-label"> Pending Prescriptions</div>
        </div>

        <div className="card stat-card">
          <div className="stat-value"></div>
          <div className="stat-label">Today's Appointments</div>
        </div>

        <div className="card stat-card">
          <div className="stat-value"></div>
          <div className="stat-label"> Appointments Requests </div>
        </div>

        <div className="card stat-card">
          <div className="stat-value"></div>
          <div className="stat-label"> On-call Schedule </div>
        </div>
      </div>

      <div className="dashboard-cards">
        <div className="card">
          <h3 style={{ color: "#2d5a27", marginBottom: "15px" }}>
            Recent Activity
          </h3>
          <p>No recent activities available.</p>
        </div>

        <div className="card">
          <h3 style={{ color: "#2d5a27", marginBottom: "15px" }}>
            Quick Actions
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <button className="btn btn-green"> On-call Doctor</button>
            <button className="btn btn-red"> Availability Schedule </button>
            <button className="btn btn-lightgreen">Approve Appointments</button>
          </div>
        </div>
      </div>
    </div>
  );
}
