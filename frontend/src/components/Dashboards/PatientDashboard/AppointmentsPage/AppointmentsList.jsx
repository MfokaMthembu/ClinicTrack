import React, { useEffect, useState } from "react";
import axiosInstance from "../../../../services/axios";
import "./AppointmentsList.css";

export default function AppointmentsList() {
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    // Fetch all appointments
    axiosInstance
      .get("/api/get-appointments")
      .then((response) => {
        setAppointments(response.data.appointments);
      })
      .catch((error) => console.error("Error fetching appointments:", error));
  }, []);

  return (
    <div className="appointments-grid-container">
      {appointments.length === 0 ? (
        <p className="no-appointments">No appointments found.</p>
      ) : (
        <div className="appointments-grid">
          {appointments.map((appt) => (
            <div key={appt.id} className={`appointment-card ${appt.status}`}>
              <div className="card-header">
                <h4>
                  {appt.patient_name || 
                  appt.patient?.user?.name || 
                  "Unnamed Patient"}
                </h4>
                <span className={`status ${appt.status}`}>
                  {appt.status.toUpperCase()}
                </span>
              </div>

              <div className="card-body">
                <p>
                  <strong>Date:</strong> {appt.preferred_date}
                </p>
                <p>
                  <strong>Time:</strong> {appt.preferred_time}
                </p>
                <p>
                  <strong>Doctor:</strong>{" "}
                  {appt.doctor?.user?.name ||
                    appt.doctor?.name ||
                    "Pending Assignment"}
                </p>

                {appt.reason && (
                  <p>
                    <strong>Reason:</strong> {appt.reason}
                  </p>
                )}

                <div className="specializations">
                  {appt.doctor_types &&
                    appt.doctor_types.map((spec, idx) => (
                      <span key={idx} className="spec-tag">
                        {spec}
                      </span>
                    ))}
                </div>
              </div>

              <div className="card-footer">
                {appt.status === "pending" && (
                  <button className="pending-btn">Awaiting Approval</button>
                )}
                {appt.status === "approved" && (
                  <button className="approved-btn">Confirmed</button>
                )}
                {appt.status === "rejected" && (
                  <button className="declined-btn">Declined</button>
                )}
                {appt.status === "completed" && (
                  <button className="completed-btn">Completed</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
