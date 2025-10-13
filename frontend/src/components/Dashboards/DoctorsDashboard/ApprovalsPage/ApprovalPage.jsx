import React, { useEffect, useState } from "react";
import axiosInstance from "../../../../services/axios";
import './ApprovalPage.css';
import '../../../Layouts/DoctorLayout/DoctorLayout.css';
import ApproveIcon from "../../../../assets/images/icons8-approve-50.png";
import DisapproveIcon from "../../../../assets/images/icons8-disable-50.png";
import ShareIcon from "../../../../assets/images/icons8-share-50.png";

export default function ApprovalPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(null); // tracks appointment being processed

  const fetchAppointments = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get("/api/appointments/pending");
      setAppointments(response.data.appointments);
    } catch (err) {
      console.error("Error fetching appointments:", err);
      setError("Failed to load appointments. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  // Approve appointment
  const handleApproval = async (id) => {
    if (processing) return;
    setProcessing(id);
    try {
      const response = await axiosInstance.post(`/api/appointments/${id}/accept`);
      // Update the appointment locally
      setAppointments((prev) =>
        prev.map((appt) =>
          appt.id === id ? response.data.appointment : appt
        )
      );
      alert("Appointment approved successfully!");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to approve appointment.");
    } finally {
      setProcessing(null);
    }
  };

  // Reject appointment
  const handleDisapproval = async (id) => {
    if (processing) return;
    const reason = prompt("Enter rejection reason (optional):");
    setProcessing(id);
    try {
      const response = await axiosInstance.patch(`/api/appointments/${id}/reject`, {
        rejection_reason: reason,
      });
      setAppointments((prev) =>
        prev.map((appt) =>
          appt.id === id ? response.data.appointment : appt
        )
      );
      alert("Appointment rejected successfully!");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to reject appointment.");
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div className='approval-dashboard'>
      <h1 className="page-title">Approve Appointment Requests</h1>
      <p>View and approve appointments made by patients that match your specialization.</p>

      {loading && <p className="loading-text">Loading appointments...</p>}
      {error && <p className="error-text">{error}</p>}

      <div className="appointments-grid-container">
        {!loading && !error && (
          appointments.length === 0 ? (
            <p className="no-appointments">No pending appointments for your specialization.</p>
          ) : (
            <div className="appointments-grid">
              {appointments.map((appt) => (
                <div key={appt.id} className={`appointment-card ${appt.status}`}>
                  <div className="card-header">
                    <h4>{appt.patient?.user?.name || appt.patient_name}</h4>
                    <span className={`status ${appt.status}`}>
                      {appt.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="card-body">
                    <p><strong>Date:</strong> {appt.preferred_date}</p>
                    <p><strong>Time:</strong> {appt.preferred_time}</p>
                    <p><strong>Doctor:</strong> {appt.employee?.name || "Pending Assignment"}</p>

                    {appt.reason && <p><strong>Reason:</strong> {appt.reason}</p>}

                    <div className="specializations">
                      {appt.doctor_types && appt.doctor_types.map((spec, idx) => (
                        <span key={idx} className="spec-tag">{spec}</span>
                      ))}
                    </div>
                  </div>

                  <div className="card-footer">
                    <button
                      className="btn-approve"
                      onClick={() => handleApproval(appt.id)}
                      disabled={processing === appt.id}
                    >
                      <img src={ApproveIcon} alt="Approve" />
                    </button>
                    <button
                      className="btn-disapprove"
                      onClick={() => handleDisapproval(appt.id)}
                      disabled={processing === appt.id}
                    >
                      <img src={DisapproveIcon} alt="Disapprove" />
                    </button>
                    <button className="btn-refferal">
                      <img src={ShareIcon} alt="Referral" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}
