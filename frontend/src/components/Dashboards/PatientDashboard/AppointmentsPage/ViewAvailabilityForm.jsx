// ViewAvailabilityForm.jsx
import { useState } from 'react';
import './ViewAvailabilityForm.css';
import axiosInstance from '../../../../services/axios';

export default function ViewAvailabilityForm() {
  const [specialization, setSpecialization] = useState('');
  const [loading, setLoading] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [availability, setAvailability] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showSchedule, setShowSchedule] = useState(false);

  const handleSpecializationChange = (e) => {
    setSpecialization(e.target.value);
    setShowSchedule(false);
    setDoctors([]);
    setSelectedDoctor(null);
    setAvailability([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!specialization) {
      alert('Please select a specialization');
      return;
    }

    try {
      setLoading(true);
      // Fetch doctors with that specialization
      const response = await axiosInstance.get(`/api/doctors/by-specialization`, {
        params: { specialization }
      });

      setDoctors(response.data.doctors || []);
      
      if (response.data.doctors.length === 0) {
        alert('No doctors found with this specialization');
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
      alert('Failed to fetch doctors. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDoctorSelect = async (doctor) => {
    setSelectedDoctor(doctor);
    setShowSchedule(true);
    await fetchDoctorAvailability(doctor.id);
  };

  const fetchDoctorAvailability = async (id) => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/api/doctors/${id}/dr-availability`);
      setAvailability(response.data.availability || []);
    } catch (error) {
      console.error('Error fetching availability:', error);
      alert('Failed to fetch doctor availability');
    } finally {
      setLoading(false);
    }
  };

  const getWeekDates = () => {
    const curr = new Date(currentDate);
    const first = curr.getDate() - curr.getDay();
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(curr.setDate(first + i));
      return date;
    });
  };

  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  const formatTime = (hour) => {
    return `${hour.toString().padStart(2, '0')}:00`;
  };

  const isSlotAvailable = (date, hour) => {
    const dateStr = formatDate(date);
    const timeStr = `${hour.toString().padStart(2, '0')}:00:00`;

    return availability.some(slot => {
      const slotDate = slot.date;
      const start = slot.start_time.slice(0, 5); // "08:00"
      const end = slot.end_time.slice(0, 5);     // "17:00"

      return (
        slotDate === dateStr &&
        timeStr >= `${start}:00` &&
        timeStr < `${end}:00` &&
        slot.is_active
      );
    });
  };


  const prevWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentDate(newDate);
  };

  const nextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  const today = () => {
    setCurrentDate(new Date());
  };

  const weekDates = getWeekDates();
  const hours = Array.from({ length: 10 }, (_, i) => i + 8); // 8 AM to 5 PM

  return (
    <div className="availability-form">
      <div className="form-section">
        <form onSubmit={handleSubmit}>
          <h4>View Availability Schedule</h4>
          
          <label>
            <span>Select the type of doctor you wish to visit</span>
            <select 
              name="specialization" 
              value={specialization}
              required 
              onChange={handleSpecializationChange}
            >
              <option value="">Select Specialization</option>
              <option value="surgeon">Surgeon</option>
              <option value="cardiology">Cardiology</option>
              <option value="dentist">Dentist</option>
              <option value="general">General Medicine</option>
              <option value="orthopedic">Orthopedic</option>
              <option value="optician">Optician</option>
              <option value="gynaecology">Gynaecology</option>
            </select>
          </label>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Loading...' : 'Find Doctors'}
          </button>
        </form>
      </div>

      {/* List of Doctors */}
      {doctors.length > 0 && (
        <div className="doctors-list">
          <h4>Available Doctors</h4>
          <div className="doctors-grid">
            {doctors.map(doctor => (
              <div 
                key={doctor.id} 
                className={`doctor-card ${selectedDoctor?.id === doctor.id ? 'selected' : ''}`}
                onClick={() => handleDoctorSelect(doctor)}
              >
                <div className="doctor-info">
                  <h5>
                    Dr. {doctor.employee?.name || 'Unknown'} {doctor.employee?.surname || ''}
                </h5>
                <p className="specialization">{doctor.employee?.specialization}</p>
                </div>
                <button className="view-schedule-btn">
                  View Schedule
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Doctor's Schedule */}
      {showSchedule && selectedDoctor && (
        <div className="schedule-section">
          <div className="schedule-header">
            <h4>
              {selectedDoctor.employee?.name || 'Doctor'}'s Availability Schedule
            </h4>
            <p className="schedule-subtitle">
              Green slots indicate when the doctor is available
            </p>
          </div>

          <div className="calendar-controls">
            <div className="nav-buttons">
              <button onClick={prevWeek} className="control-btn">← Prev Week</button>
              <button onClick={today} className="control-btn">This Week</button>
              <button onClick={nextWeek} className="control-btn">Next Week →</button>
            </div>
            
            <h5 className="current-month">
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h5>
          </div>

          <div className="calendar-wrapper">
            <table className="calendar-table">
              <thead>
                <tr>
                  <th className="time-header">Time</th>
                  {weekDates.map((date, i) => (
                    <th 
                      key={i} 
                      className={`date-header ${date.toDateString() === new Date().toDateString() ? 'today' : ''}`}
                    >
                      <div className="day-name">
                        {date.toLocaleDateString('en-US', { weekday: 'short' })}
                      </div>
                      <div className="date-number">
                        {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {hours.map(hour => (
                  <tr key={hour}>
                    <td className="time-cell">
                      {formatTime(hour)}
                    </td>
                    {weekDates.map((date, i) => {
                      const isAvailable = isSlotAvailable(date, hour);
                      return (
                        <td 
                          key={i}
                          className={`time-slot ${isAvailable ? 'available' : 'unavailable'}`}
                          title={isAvailable ? 'Doctor available' : 'Unavailable'}
                        >
                          {isAvailable ? 'Available' : ''}
                        </td>

                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {availability.length === 0 && (
            <div className="no-availability">
              <p>This doctor has not set their availability schedule yet.</p>
            </div>
          )}
        </div>
      )}

      {loading && (
        <div className="loading-overlay">
          <div className="spinner">Loading...</div>
        </div>
      )}
    </div>
  );
}