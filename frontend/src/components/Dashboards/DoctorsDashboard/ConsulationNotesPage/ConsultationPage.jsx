import React, { useEffect, useState } from 'react';
import axiosInstance from '../../../../services/axios';
import './ConsultationPage.css';
import '../../../Layouts/DoctorLayout/DoctorLayout.css';
import WritePrescription from '../../../../assets/images/icons8-write-50.png';
import PrescriptionForm from './PrescriptionForm';

export default function ConsultationPage() {
  const [appointments, setAppointments] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedAppointments, setSelectedAppointments] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null); // ✅ Track selected appointment
  
  const openModal = (appointment) => {
    setSelectedAppointment(appointment); // ✅ Store the appointment data
    setShowModal(true);
  };
  
  const closeModal = () => {
    setShowModal(false);
    setSelectedAppointment(null);
  };

  // Fetch all approved appointments on component mount
  useEffect(() => {
    fetchAllApprovedAppointments();
  }, []);

  const fetchAllApprovedAppointments = async () => {
    setLoading(true);
    setIsSearching(false);
    try {
      const response = await axiosInstance.get('/api/doctor/approved-appointments');
      setAppointments(response.data.appointments);
    } catch (error) {
      console.error('Error fetching approved appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!query.trim()) {
      fetchAllApprovedAppointments();
      return;
    }

    setLoading(true);
    setIsSearching(true);
    try {
      const response = await axiosInstance.get('/api/doctor/search-approved-appointments', {
        params: { search: query }
      });
      setAppointments(response.data.appointments);
    } catch (error) {
      console.error('Error searching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleClearSearch = () => {
    setQuery('');
    fetchAllApprovedAppointments();
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedAppointments(appointments.map(appt => appt.id));
    } else {
      setSelectedAppointments([]);
    }
  };

  const handleSelectAppointment = (id) => {
    setSelectedAppointments(prev => 
      prev.includes(id) 
        ? prev.filter(appointmentId => appointmentId !== id)
        : [...prev, id]
    );
  };

  const handlePrescriptionSuccess = () => {
    closeModal();
    fetchAllApprovedAppointments(); // ✅ Refresh the list after prescription is created
  };

  return (
    <div className='consultation-dashboard'>
      <h1 className="page-title">Consultation Notes & Prescriptions</h1>
      <p>View Patient medical history, Write Consultation Notes & Prescriptions</p>
      
      <div className="appointments-management">
        {/* Search and Controls */}
        <div className="search-actions">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search by name, surname, ID, or reason..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <button type="button" className="icon" onClick={handleSearch}>
              &#128269;
            </button>
            {query && (
              <button type="button" className="clear-btn" onClick={handleClearSearch}>
                Clear
              </button>
            )}
          </div>
        </div>
        
        {/* Appointments Table */}
        <div className="card-table">
          {loading ? (
            <p className="loading-text">Loading appointments...</p>
          ) : (
            <table className="appointments-table">
              <thead>
                <tr>
                  <th>
                    <input 
                      type="checkbox" 
                      onChange={handleSelectAll}
                      checked={selectedAppointments.length === appointments.length && appointments.length > 0}
                    />
                  </th>
                  <th>Appointment ID</th>
                  <th>Patient Name</th>
                  <th>Patient Surname</th>
                  <th>Medical History</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Reason For Appointment</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="no-data">
                      {isSearching 
                        ? 'No appointments found matching your search' 
                        : 'No approved appointments found'}
                    </td>
                  </tr>
                ) : (
                  appointments.map((appt) => (
                    <tr key={appt.id}>
                      <td>
                        <input 
                          type="checkbox" 
                          checked={selectedAppointments.includes(appt.id)}
                          onChange={() => handleSelectAppointment(appt.id)}
                        />
                      </td>
                      <td>{appt.id}</td>
                      <td>{appt.patient_name || 'N/A'}</td>
                      <td>{appt.patient_surname || 'N/A'}</td>
                      <td className="medical-history-cell">
                        {appt.medical_history ? (
                          <span title={appt.medical_history}>
                            {appt.medical_history.substring(0, 50)}
                            {appt.medical_history.length > 50 ? '...' : ''}
                          </span>
                        ) : (
                          'None'
                        )}
                      </td>
                      <td>{appt.preferred_date}</td>
                      <td>{appt.preferred_time}</td>
                      <td>{appt.reason || 'N/A'}</td>
                      <td>
                        <span className={`status-badge ${appt.status}`}>
                          {appt.status.toUpperCase()}
                        </span>
                      </td>
                      <td>
                        <button 
                          className="btn-action" 
                          onClick={() => openModal(appt)} // ✅ Pass the appointment
                        >
                          <img src={WritePrescription} alt='Add Prescription & Notes' />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>     
      </div>

      {/* Write Prescriptions Modal - ✅ Fixed condition */}
      {showModal && selectedAppointment && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-container modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Write Prescription - {selectedAppointment.patient_name} {selectedAppointment.patient_surname}</h2>
              <button className="close-btn" onClick={closeModal}>
                &times;
              </button>
            </div>
            <div className="modal-body">
              <PrescriptionForm 
                appointmentId={selectedAppointment.id}
                patientId={selectedAppointment.patient_id}
                onSuccess={handlePrescriptionSuccess}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}