import React, { useState, useEffect } from 'react';
import './AddMedicineForm.css'; // Reuse same styles
import axiosInstance from '../../../../../services/axios';

export default function UpdateMedicineForm({ medicineId, onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    generic_name: '',
    category: '',
    dosage_form: '',
    strength: '',
    quantity: '',
    price: '',
    expiry_date: ''
  });
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch medicine data when component mounts
  useEffect(() => {
    fetchMedicineData();
  }, [medicineId]);

  const fetchMedicineData = async () => {
    try {
      const response = await axiosInstance.get(`/api/medicines/${medicineId}`);
      const medicine = response.data.medicine;
      
      setFormData({
        name: medicine.name || '',
        generic_name: medicine.generic_name || '',
        category: medicine.category || '',
        dosage_form: medicine.dosage_form || '',
        strength: medicine.strength || '',
        quantity: medicine.quantity || '',
        price: medicine.price || '',
        expiry_date: medicine.expiry_date || ''
      });
    } catch (error) {
      console.error('Error fetching medicine:', error);
      setError('Failed to load medicine data');
    } finally {
      setFetchLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await axiosInstance.put(`/api/medicines/${medicineId}`, formData);
      setSuccess('Medicine updated successfully!');
      
      if (onSuccess) {
        setTimeout(() => {
          onSuccess(response.data.medicine);
        }, 1500);
      }
    } catch (error) {
      console.error('Error updating medicine:', error);
      setError(error.response?.data?.message || 'Failed to update medicine');
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return <div className="loading-text">Loading medicine data...</div>;
  }

  return (
    <div className="medicine-container">     
      <h4>Update Medication</h4>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
      
      <form onSubmit={handleSubmit}>
        <label className="medicine-field">
          <span>Name <span className="required">*</span></span>
          <input 
            type="text" 
            name="name" 
            value={formData.name}
            onChange={handleChange}
            required 
          />
        </label>

        <label className="medicine-field">
          <span>Generic Name</span>
          <input 
            type="text" 
            name="generic_name"
            value={formData.generic_name}
            onChange={handleChange}
          />
        </label>

        <label className="medicine-field">
          <span>Category <span className="required">*</span></span>
          <select 
            name='category'
            value={formData.category}
            onChange={handleChange}
            required
          >
            <option value="">-- Select Medical Category --</option>
            <option value="Analgesics">Analgesics</option>
            <option value="Antibiotics">Antibiotics</option>
            <option value="Antidepressents">Antidepressents</option>
            <option value="Antifungals">Antifungals</option>
            <option value="Hormones">Hormones</option>
            <option value="Diuretics">Diuretics</option>
          </select>
        </label>

        <label className="medicine-field">
          <span>Dosage Form</span>
          <input 
            type="text" 
            name="dosage_form"
            value={formData.dosage_form}
            onChange={handleChange}
            placeholder="e.g., Tablet, Capsule, Syrup"
          />
        </label>

        <label className="medicine-field">
          <span>Strength</span>
          <input 
            type="text" 
            name="strength"
            value={formData.strength}
            onChange={handleChange}
            placeholder="e.g., 500mg, 10ml"
          />
        </label>                    

        <label className="medicine-field">
          <span>Quantity <span className="required">*</span></span>
          <input 
            type="number" 
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            min="0"
            required 
          />
        </label>  

        <label className="medicine-field">
          <span>Price <span className="required">*</span></span>
          <input 
            type="number" 
            name="price"
            value={formData.price}
            onChange={handleChange}
            step="0.01"
            min="0"
            required 
          />
        </label>  

        <label className="medicine-field">
          <span>Expiry Date</span>
          <input 
            type="date" 
            name="expiry_date"
            value={formData.expiry_date}
            onChange={handleChange}
          />
        </label>  

        <div className="form-actions">
          {onCancel && (
            <button type="button" className="cancel-btn" onClick={onCancel}>
              Cancel
            </button>
          )}
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Updating...' : 'Update Medicine'}
          </button>
        </div>
      </form>          
    </div>
  );
}