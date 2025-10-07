import './PatientDashboardPage.css';
import '../../../Layouts/PatientLayout/PatientLayout.css';

export default function PatientDashboardPage() {
  return (
    <div className='patient-dashboard'>
      <h1 className="page-title">Patient Dashboard</h1>
      <p className="page-subtitle">Welcome to your medical dashboard</p>

      <div className="dashboard-cards">
        <div className="card stat-card">
          <div className="stat-value"> </div>
          <div className="stat-label">Pending Prescriptions</div>
        </div>
        <div className="card stat-card">
          <div className="stat-value"> </div>
          <div className="stat-label">Today's Appointments</div>
        </div>
        <div className="card stat-card">
          <div className="stat-value"> </div>
          <div className="stat-label">Ambulance Requests</div>
        </div>
        <div className="card stat-card">
          <div className="stat-value"> </div>
          <div className="stat-label">Available Dates</div>
        </div>
      </div>
    </div>
  );
}
