import React, { useState, useEffect } from 'react';
import axiosInstance from '../../../../services/axios';
import './PrescriptionForm.css';

export default function PrescriptionForm({ appointmentId, patientId, onSuccess }) {
    const [consultationNotes, setConsultationNotes] = useState('');
    const [medicines, setMedicines] = useState([]);
    const [prescriptionItems, setPrescriptionItems] = useState([
        { medicine_id: '', quantity: 1, dosage_instructions: '' }
    ]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Fetch available medicines
    useEffect(() => {
            fetchMedicines();
        }, []);

    const fetchMedicines = async () => {
        try {
            const response = await axiosInstance.get('/api/medicines/available'); 
            setMedicines(response.data.medicines || []);
        } catch (error) {
            console.error('Error fetching medicines:', error);
            setError('Failed to load medicines');
        }
    };

  const addMedicineRow = () => {
    setPrescriptionItems([
      ...prescriptionItems,
      { medicine_id: '', quantity: 1, dosage_instructions: '' }
    ]);
  };

  const removeMedicineRow = (index) => {
    if (prescriptionItems.length > 1) {
      const updated = prescriptionItems.filter((_, i) => i !== index);
      setPrescriptionItems(updated);
    }
  };

  const updateMedicineRow = (index, field, value) => {
    const updated = [...prescriptionItems];
    updated[index][field] = value;
    setPrescriptionItems(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    const hasEmptyMedicine = prescriptionItems.some(item => !item.medicine_id);
    if (hasEmptyMedicine) {
      setError('Please select a medicine for all rows');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        appointment_id: appointmentId,
        patient_id: patientId,
        consultation_notes: consultationNotes,
        items: prescriptionItems.map(item => ({
          medicine_id: parseInt(item.medicine_id),
          quantity: parseInt(item.quantity),
          dosage_instructions: item.dosage_instructions
        }))
      };

      const response = await axiosInstance.post('/api/prescriptions', payload);
      
      setSuccess('Prescription created successfully!');
      
      // Reset form
      setConsultationNotes('');
      setPrescriptionItems([{ medicine_id: '', quantity: 1, dosage_instructions: '' }]);
      
      if (onSuccess) {
        onSuccess(response.data.prescription);
      }
    } catch (error) {
      console.error('Error creating prescription:', error);
      setError(error.response?.data?.message || 'Failed to create prescription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="prescription-container">
      <h2>Write Prescription</h2>
      
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <form onSubmit={handleSubmit}>
        {/* Consultation Notes */}
        <div className="prescription-field">
          <label>Consultation Notes</label>
          <textarea
            name="consultation_notes"
            value={consultationNotes}
            onChange={(e) => setConsultationNotes(e.target.value)}
            rows="4"
            placeholder="Enter consultation notes, diagnosis, and observations..."
          />
        </div>

        {/* Medicines Section */}
        <div className="medicines-section">
          <div className="section-header">
            <h3>Prescription Items</h3>
            <button
              type="button"
              className="btn-add-medicine"
              onClick={addMedicineRow}
            >
              + Add Medicine
            </button>
          </div>

          {prescriptionItems.map((item, index) => (
            <div key={index} className="medicine-row">
              <div className="row-number">{index + 1}</div>
              
              <div className="medicine-fields">
                <div className="field-group">
                  <label>Medicine</label>
                  <select
                    value={item.medicine_id}
                    onChange={(e) => updateMedicineRow(index, 'medicine_id', e.target.value)}
                    required
                  >
                    <option value="">Select Medicine</option>
                    {medicines.map((med) => (
                      <option key={med.id} value={med.id}>
                        {med.name} - {med.dosage_form}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="field-group">
                  <label>Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateMedicineRow(index, 'quantity', e.target.value)}
                    required
                  />
                </div>

                <div className="field-group dosage-field">
                  <label>Dosage Instructions</label>
                  <input
                    type="text"
                    value={item.dosage_instructions}
                    onChange={(e) => updateMedicineRow(index, 'dosage_instructions', e.target.value)}
                    placeholder="e.g., Take 1 tablet twice daily after meals"
                  />
                </div>

                {prescriptionItems.length > 1 && (
                  <button
                    type="button"
                    className="btn-remove"
                    onClick={() => removeMedicineRow(index)}
                    title="Remove medicine"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Submit Button */}
        <div className="form-actions">
          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? 'Creating Prescription...' : 'Write Prescription'}
          </button>
        </div>
      </form>
    </div>
  );
}