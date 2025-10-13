import React, { useState, useEffect } from 'react';
import axiosInstance from '../../../../services/axios';
import './PrescriptionPage.css';
import '../../../Layouts/PatientLayout/PatientLayout.css';

export default function PrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/api/patient/prescriptions');
      setPrescriptions(response.data.prescriptions);
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
      setError('Failed to load prescriptions');
    } finally {
      setLoading(false);
    }
  };

  const handleViewPrescription = (prescription) => {
    setSelectedPrescription(prescription);
    setShowModal(true);
    setError('');
    setSuccess('');
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedPrescription(null);
    setError('');
    setSuccess('');
  };

  const handleSendToPharmacy = async () => {
    if (!selectedPrescription) return;

    if (!window.confirm('Are you sure you want to send this prescription to the pharmacy?')) {
      return;
    }

    setSending(true);
    setError('');
    setSuccess('');

    try {
      await axiosInstance.post(`/api/patient/prescriptions/${selectedPrescription.id}/send-to-pharmacy`);
      setSuccess('Prescription sent to pharmacy successfully!');
      
      // Remove from list or refresh
      setTimeout(() => {
        handleCloseModal();
        fetchPrescriptions();
      }, 2000);
    } catch (error) {
      console.error('Error sending prescription:', error);
      setError(error.response?.data?.message || 'Failed to send prescription to pharmacy');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="prescriptionspage-dashboard">
      <h1 className="page-title">Prescriptions dashboard</h1>
      <p className="page-subtitle">View and manage your prescriptions here.</p>

      {error && !showModal && <div className="alert alert-error">{error}</div>}

      {/* View Prescription Cards */}
      <div className='prescriptionspage-cards-container'>
        {loading ? (
          <p className="loading-text">Loading prescriptions...</p>
        ) : prescriptions.length === 0 ? (
          <div className="no-prescriptions">
            <p>No pending prescriptions found.</p>
          </div>
        ) : (
          prescriptions.map((prescription) => (
            <div key={prescription.id} className="prescription-card">
              <div className="card-header">
                <div className="prescription-info">
                  <h3>Prescription #{prescription.id}</h3>
                  <span className="prescription-date">
                    {new Date(prescription.created_at).toLocaleDateString()}
                  </span>
                </div>
                <span className={`status-badge ${prescription.status}`}>
                  {prescription.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>

              <div className="card-body">
                <div className="info-row">
                  <strong>Patient:</strong>
                  <span>{prescription.patient_name} {prescription.patient_surname}</span>
                </div>

                <div className="info-row">
                  <strong>Prescribed by:</strong>
                  <span>Dr. {prescription.doctor_name} {prescription.doctor_surname}</span>
                </div>

                {prescription.consultation_notes && (
                  <div className="consultation-notes">
                    <strong>Consultation Notes:</strong>
                    <p>{prescription.consultation_notes}</p>
                  </div>
                )}

                <div className="medicines-count">
                  <strong>{prescription.items.length}</strong> medicine(s) prescribed
                </div>
              </div>

              <div className="card-footer">
                <button 
                  className="btn-view-prescription"
                  onClick={() => handleViewPrescription(prescription)}
                >
                  View Prescription
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal to view and send prescriptions to pharmacy */}
      {showModal && selectedPrescription && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-container modal-prescription" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Prescription Details</h2>
              <button className="close-btn" onClick={handleCloseModal}>
                &times;
              </button>
            </div>

            <div className="modal-body">
              {error && <div className="alert alert-error">{error}</div>}
              {success && <div className="alert alert-success">{success}</div>}

              {/* Prescription Header */}
              <div className="prescription-header">
                <div className="prescription-id">
                  <h3>Prescription #{selectedPrescription.id}</h3>
                  <span className="date">
                    Issued: {new Date(selectedPrescription.created_at).toLocaleDateString()}
                  </span>
                </div>

                <div className="prescription-parties">
                  <div className="party-info">
                    <label>Patient:</label>
                    <p>{selectedPrescription.patient_name} {selectedPrescription.patient_surname}</p>
                  </div>
                  <div className="party-info">
                    <label>Prescribed by:</label>
                    <p>Dr. {selectedPrescription.doctor_name} {selectedPrescription.doctor_surname}</p>
                  </div>
                </div>
              </div>

              {/* Consultation Notes */}
              {selectedPrescription.consultation_notes && (
                <div className="consultation-section">
                  <h4>Consultation Notes</h4>
                  <div className="consultation-content">
                    {selectedPrescription.consultation_notes}
                  </div>
                </div>
              )}

              {/* Prescribed Medicines */}
              <div className="medicines-section">
                <h4>Prescribed Medicines</h4>
                <div className="medicines-list">
                  {selectedPrescription.items.map((item, index) => (
                    <div key={item.id} className="medicine-item">
                      <div className="medicine-number">{index + 1}</div>
                      <div className="medicine-details">
                        <div className="medicine-name">
                          <strong>{item.medicine_name}</strong>
                          {item.medicine_generic_name && (
                            <span className="generic-name">({item.medicine_generic_name})</span>
                          )}
                        </div>
                        <div className="medicine-specs">
                          {item.dosage_form && <span className="spec">{item.dosage_form}</span>}
                          {item.strength && <span className="spec">{item.strength}</span>}
                          <span className="quantity">Qty: {item.quantity}</span>
                        </div>
                        {item.dosage_instructions && (
                          <div className="dosage-instructions">
                            <strong>Instructions:</strong> {item.dosage_instructions}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="modal-actions">
                <button 
                  className="btn-secondary" 
                  onClick={handleCloseModal}
                  disabled={sending}
                >
                  Close
                </button>
                <button 
                  className="btn-send-pharmacy"
                  onClick={handleSendToPharmacy}
                  disabled={sending}
                >
                  {sending ? 'Sending...' : 'Send to Pharmacy'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}