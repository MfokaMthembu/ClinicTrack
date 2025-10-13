import React, { useState, useEffect } from 'react';
import axiosInstance from '../../../../services/axios';
import './DispensaryPage.css';

export default function DispensaryPage() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [dispensing, setDispensing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchPendingPrescriptions();
  }, []);

  const fetchPendingPrescriptions = async () => {
    setLoading(true);
    setIsSearching(false);
    try {
      const response = await axiosInstance.get('/api/pharmacy/prescriptions');
      setPrescriptions(response.data.prescriptions);
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!query.trim()) {
      fetchPendingPrescriptions();
      return;
    }

    setLoading(true);
    setIsSearching(true);
    try {
      const response = await axiosInstance.get('/api/pharmacy/prescriptions/search', {
        params: { search: query }
      });
      setPrescriptions(response.data.prescriptions);
    } catch (error) {
      console.error('Error searching prescriptions:', error);
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
    fetchPendingPrescriptions();
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

  const handleDispense = async () => {
    if (!selectedPrescription) return;

    if (!window.confirm('Are you sure you want to dispense this prescription? Stock will be automatically deducted.')) {
      return;
    }

    setDispensing(true);
    setError('');
    setSuccess('');

    try {
      await axiosInstance.post(`/api/pharmacy/prescriptions/${selectedPrescription.id}/dispense`);
      setSuccess('Prescription dispensed successfully! Stock has been updated.');
      
      setTimeout(() => {
        handleCloseModal();
        fetchPendingPrescriptions();
      }, 2000);
    } catch (error) {
      console.error('Error dispensing prescription:', error);
      const errorMsg = error.response?.data?.message || 'Failed to dispense prescription';
      const stockIssues = error.response?.data?.stock_issues;
      
      if (stockIssues && stockIssues.length > 0) {
        setError(`${errorMsg}:\n${stockIssues.join('\n')}`);
      } else {
        setError(errorMsg);
      }
    } finally {
      setDispensing(false);
    }
  };

  return (
    <div className="dispensary-dashboard">
      <h1 className="page-title">Dispensary Dashboard</h1>
      <p className="page-subtitle">
        View and dispense prescribed medicine to patients
      </p>

      {/* Search Bar */}
      <div className="search-actions">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search..."
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

      {/* Prescribed medicines waiting to be dispensed */}
      <div className="prescriptions-container">
        {loading ? (
          <p className="loading-text">Loading prescriptions...</p>
        ) : prescriptions.length === 0 ? (
          <div className="no-prescriptions">
            <p>
              {isSearching 
                ? 'No prescriptions found matching your search' 
                : 'No prescriptions awaiting dispensary'}
            </p>
          </div>
        ) : (
          <div className="prescriptions-grid">
            {prescriptions.map((prescription) => (
              <div key={prescription.id} className="prescription-card">
                <div className="card-header">
                  <div className="prescription-info">
                    <h3>Prescription #{prescription.id}</h3>
                    <span className="prescription-date">
                      {new Date(prescription.created_at).toLocaleString()}
                    </span>
                  </div>
                  <span className={`status-badge ${prescription.status}`}>
                    {prescription.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>

                <div className="card-body">
                  <div className="patient-section">
                    <div className="section-title">Patient</div>
                    <div className="name-display">
                      {prescription.patient_name} {prescription.patient_surname}
                    </div>
                  </div>

                  <div className="doctor-section">
                    <div className="section-title">Prescribed By</div>
                    <div className="name-display">
                      Dr. {prescription.doctor_name} {prescription.doctor_surname}
                    </div>
                  </div>

                  <div className="medicines-summary">
                    <strong>{prescription.items.length}</strong> medicine(s) to dispense
                  </div>

                  {/* Stock Warning */}
                  {prescription.items.some(item => item.available_stock < item.quantity) && (
                    <div className="stock-warning">
                       Insufficient stock for some items
                    </div>
                  )}
                </div>

                <div className="card-footer">
                  <button 
                    className="btn-view-details"
                    onClick={() => handleViewPrescription(prescription)}
                  >
                    View & Dispense
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Dispense Modal */}
      {showModal && selectedPrescription && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-container modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Prescription Details - #{selectedPrescription.id}</h2>
              <button className="close-btn" onClick={handleCloseModal}>
                &times;
              </button>
            </div>

            <div className="modal-body">
              {error && <div className="alert alert-error" style={{whiteSpace: 'pre-line'}}>{error}</div>}
              {success && <div className="alert alert-success">{success}</div>}

              {/* Patient & Doctor Info */}
              <div className="prescription-parties">
                <div className="party-info">
                  <label>Patient:</label>
                  <p>{selectedPrescription.patient_name} {selectedPrescription.patient_surname}</p>
                </div>
                <div className="party-info">
                  <label>Prescribed by:</label>
                  <p>Dr. {selectedPrescription.doctor_name} {selectedPrescription.doctor_surname}</p>
                </div>
                <div className="party-info">
                  <label>Date:</label>
                  <p>{new Date(selectedPrescription.created_at).toLocaleString()}</p>
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

              {/* Medicines to Dispense */}
              <div className="medicines-section">
                <h4>Medicines to Dispense</h4>
                <div className="medicines-list">
                  {selectedPrescription.items.map((item, index) => {
                    const hasStock = item.available_stock >= item.quantity;
                    return (
                      <div key={item.id} className={`medicine-item ${!hasStock ? 'insufficient-stock' : ''}`}>
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
                            <span className={`stock ${!hasStock ? 'low' : ''}`}>
                              Stock: {item.available_stock}
                            </span>
                          </div>
                          {item.dosage_instructions && (
                            <div className="dosage-instructions">
                              <strong>Instructions:</strong> {item.dosage_instructions}
                            </div>
                          )}
                          {!hasStock && (
                            <div className="stock-error">
                               Insufficient stock (Need: {item.quantity}, Available: {item.available_stock})
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="modal-actions">
                <button 
                  className="btn-secondary" 
                  onClick={handleCloseModal}
                  disabled={dispensing}
                >
                  Close
                </button>
                <button 
                  className="btn-dispense"
                  onClick={handleDispense}
                  disabled={dispensing || selectedPrescription.items.some(item => item.available_stock < item.quantity)}
                >
                  {dispensing ? 'Dispensing...' : 'Dispense'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}