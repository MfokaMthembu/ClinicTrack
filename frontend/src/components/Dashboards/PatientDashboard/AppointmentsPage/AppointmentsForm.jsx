import { useState } from 'react';
import './AppointmentsForm.css';
import axiosInstance from '../../../../services/axios';

export default function AppointmentsForm({ onSuccess }) {
    const [formData, setFormData] = useState({
        preferred_date: '',
        preferred_time: '',
        doctor_types: [],
        reason: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleCheckboxChange = (value) => {
        setFormData(prev => ({
            ...prev,
            doctor_types: prev.doctor_types.includes(value)
                ? prev.doctor_types.filter(type => type !== value)
                : [...prev.doctor_types, value]
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Validation
        if (formData.doctor_types.length === 0) {
            setError('Please select at least one doctor type');
            setLoading(false);
            return;
        }

        try {
            const response = await axiosInstance.post('/api/appointments', formData);
            
            if (response.status === 201) {
                alert(response.data.message || 'Appointment booked successfully!');
                // Reset form
                setFormData({
                    preferred_date: '',
                    preferred_time: '',
                    doctor_types: [],
                    reason: ''
                });
                if (onSuccess) onSuccess(response.data.appointment);
            }
        } catch (err) {
            setError(
                err.response?.data?.message || 
                'Failed to book appointment. Please try again.'
            );
            console.error('Error booking appointment:', err);
        } finally {
            setLoading(false);
        }
    };

    const getTodayDate = () => {
        return new Date().toISOString().split('T')[0];
    };

    return (
        <div className="appointment-container">     
            <form onSubmit={handleSubmit}>
                {error && <div className="error-message">{error}</div>}

                <label className="appointment-field">
                    <span>Preferred Date</span>
                    <input 
                        type="date" 
                        name="preferred_date"
                        value={formData.preferred_date}
                        min={getTodayDate()}
                        onChange={(e) => setFormData({...formData, preferred_date: e.target.value})}
                        required 
                    />
                </label>

                <label className="appointment-field">
                    <span>Preferred Time Slot</span>
                    <input 
                        type="time" 
                        name="preferred_time"
                        value={formData.preferred_time}
                        onChange={(e) => setFormData({...formData, preferred_time: e.target.value})}
                        required 
                    />
                </label>

                <label className="appointment-field">
                    <span>Type of Doctor</span>
                    <div className="doctor-grid">
                        <label>
                            <input 
                                type="checkbox" 
                                checked={formData.doctor_types.includes('Surgeon')}
                                onChange={() => handleCheckboxChange('Surgeon')}
                            /> Surgeon
                        </label>
                        <label>
                            <input 
                                type="checkbox" 
                                checked={formData.doctor_types.includes('Cardiology')}
                                onChange={() => handleCheckboxChange('Cardiology')}
                            /> Cardiology
                        </label>
                        <label>
                            <input 
                                type="checkbox" 
                                checked={formData.doctor_types.includes('Dentist')}
                                onChange={() => handleCheckboxChange('Dentist')}
                            /> Dentist
                        </label>
                        <label>
                            <input 
                                type="checkbox" 
                                checked={formData.doctor_types.includes('General')}
                                onChange={() => handleCheckboxChange('General')}
                            /> General Medicine
                        </label>
                        <label>
                            <input 
                                type="checkbox" 
                                checked={formData.doctor_types.includes('Orthopedic')}
                                onChange={() => handleCheckboxChange('Orthopedic')}
                            /> Orthopedic
                        </label>
                        <label>
                            <input 
                                type="checkbox" 
                                checked={formData.doctor_types.includes('Optician')}
                                onChange={() => handleCheckboxChange('Optician')}
                            /> Optician
                        </label>
                        <label>
                            <input 
                                type="checkbox" 
                                checked={formData.doctor_types.includes('Gynaecology')}
                                onChange={() => handleCheckboxChange('Gynaecology')}
                            /> Gynaecology
                        </label>
                    </div>
                </label>

                <label className="appointment-field">
                    <span>Reason</span>
                    <textarea 
                        name="reason"
                        value={formData.reason}
                        onChange={(e) => setFormData({...formData, reason: e.target.value})}
                        maxLength="1000"
                        rows="4"
                        required 
                    />
                </label>

                <button type="submit" className="submit-btn" disabled={loading}>
                    {loading ? 'Booking...' : 'Book An Appointment'}
                </button>
            </form>
        </div>
    );
}