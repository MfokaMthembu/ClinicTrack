import { useState, useEffect } from 'react';
import './AvailabilityPage.css';
import '../../../Layouts/DoctorLayout/DoctorLayout.css';
import axiosInstance from '../../../../services/axios';

export default function AvailabilityPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState('week');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch availability when component mounts
  useEffect(() => {
    fetchAvailability();
  }, []);

  /** -------------------------------
   * FETCH DOCTOR AVAILABILITY
   * ------------------------------- */
  const fetchAvailability = async () => {
    try {
      const response = await axiosInstance.get('/api/doctor/get-availability');
      console.log('Fetched availability data:', response.data);

      // Handle different possible response shapes
      const availabilityData =
        response.data.availability ||
        response.data.data ||
        response.data ||
        [];

      setEvents(availabilityData);
    } catch (error) {
      console.error('Error fetching availability:', error);
      if (error.response?.status === 401) {
        alert('Session expired. Please login again.');
      }
    }
  };

  /** -------------------------------
   * SAVE AVAILABILITY SLOT
   * ------------------------------- */
  const saveAvailability = async (date, startTime, endTime) => {
    try {
      setLoading(true);
      const response = await axiosInstance.post('/api/doctor/availability', {
        date,
        start_time: startTime,
        end_time: endTime,
      });

      if (response.status === 201) {
        await fetchAvailability();
        alert('Availability slot added successfully!');
      }
    } catch (error) {
      console.error('Error saving availability:', error);
      alert(error.response?.data?.message || 'Failed to save availability');
    } finally {
      setLoading(false);
    }
  };

  /** -------------------------------
   * DELETE AVAILABILITY SLOT
   * ------------------------------- */
  const deleteAvailability = async (id) => {
    if (!window.confirm('Remove this availability slot?')) return;

    try {
      setLoading(true);
      const response = await axiosInstance.delete(`/api/doctor/availability/${id}`);

      if (response.status === 200) {
        await fetchAvailability();
        alert('Availability slot removed!');
      }
    } catch (error) {
      console.error('Error deleting availability:', error);
      alert('Failed to delete availability');
    } finally {
      setLoading(false);
    }
  };

  /** -------------------------------
   * UTILITY HELPERS
   * ------------------------------- */
  const getWeekDates = () => {
    const curr = new Date(currentDate);
    const first = curr.getDate() - curr.getDay();
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(curr.setDate(first + i));
      return new Date(date);
    });
  };

  const formatDate = (date) => date.toISOString().split('T')[0];
  const formatTime = (hour) => `${hour.toString().padStart(2, '0')}:00`;
  const normalizeTime = (time) => time?.slice(0, 5); // converts "08:00:00" → "08:00"

  // 
  const handleTimeSlotClick = (date, hour) => {
    const startTime = formatTime(hour);
    const endTime = formatTime(hour + 1);
    const dateStr = formatDate(date);

    const event = getEventForSlot(date, hour);
    if (event) {
      deleteAvailability(event.id);
    } else {
      saveAvailability(dateStr, startTime, endTime);
    }
  };

  const isSlotAvailable = (date, hour) => {
    const dateStr = formatDate(date);
    const timeStr = formatTime(hour);
    return events.some(
      (e) =>
        e.date?.startsWith(dateStr) &&
        normalizeTime(e.start_time) <= timeStr &&
        normalizeTime(e.end_time) > timeStr
    );
  };

  const getEventForSlot = (date, hour) => {
    const dateStr = formatDate(date);
    const timeStr = formatTime(hour);
    return events.find(
      (e) =>
        e.date?.startsWith(dateStr) &&
        normalizeTime(e.start_time) <= timeStr &&
        normalizeTime(e.end_time) > timeStr
    );
  };

  // navigation controls
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

  const today = () => setCurrentDate(new Date());

  // rendering 
  const weekDates = view === 'week' ? getWeekDates() : [currentDate];
  const hours = Array.from({ length: 10 }, (_, i) => i + 8);

  return (
    <div className="doctor-dashboard">
      <div className="availability-header">
        <h1 className="page-title">Appointment Schedule</h1>
        <p>Click time slots to mark when you're available. Click again to remove.</p>
      </div>

      {loading && <div className="loading-banner">Processing...</div>}

      <div className="availability-card">
        {/* Header Controls */}
        <div className="calendar-controls">
          <div className="nav-buttons">
            <button onClick={prevWeek} className="control-btn">← Prev</button>
            <button onClick={today} className="control-btn">Today</button>
            <button onClick={nextWeek} className="control-btn">Next →</button>
          </div>

          <h3 className="current-month">
            {currentDate.toLocaleDateString('en-US', {
              month: 'long',
              year: 'numeric',
            })}
          </h3>

          <div className="view-buttons">
            <button
              onClick={() => setView('week')}
              className={`control-btn ${view === 'week' ? 'active' : ''}`}
            >
              Week
            </button>
            <button
              onClick={() => setView('day')}
              className={`control-btn ${view === 'day' ? 'active' : ''}`}
            >
              Day
            </button>
          </div>
        </div>

        {/* Calendar Table */}
        <div className="calendar-wrapper">
          <table className="calendar-table">
            <thead>
              <tr>
                <th className="time-header">Time</th>
                {weekDates.map((date, i) => (
                  <th
                    key={i}
                    className={`date-header ${
                      date.toDateString() === new Date().toDateString() ? 'today' : ''
                    }`}
                  >
                    <div className="day-name">
                      {date.toLocaleDateString('en-US', { weekday: 'short' })}
                    </div>
                    <div className="date-number">
                      {date.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {hours.map((hour) => (
                <tr key={hour}>
                  <td className="time-cell">{formatTime(hour)}</td>
                  {weekDates.map((date, i) => {
                    const isAvailable = isSlotAvailable(date, hour);
                    return (
                      <td
                        key={i}
                        className={`time-slot ${isAvailable ? 'available' : ''}`}
                        onClick={() => handleTimeSlotClick(date, hour)}
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

        {/* Instructions */}
        <div className="instructions-box">
          <strong>Instructions:</strong>
          <ul>
            <li>Click on empty time slots to mark yourself as available</li>
            <li>Click on green (available) slots to remove them</li>
            <li>Switch between week and day views using the buttons above</li>
            <li>Navigate through weeks using the arrow buttons</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
