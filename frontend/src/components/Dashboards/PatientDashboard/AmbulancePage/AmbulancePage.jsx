import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import axiosInstance from '../../../../services/axios';
import 'leaflet/dist/leaflet.css';
import LocationIcon from '../../../../assets/images/icons8-location-96.png';
import './AmbulancePage.css';

// Fix for default marker icons in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom ambulance icon
const ambulanceIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/2913/2913133.png',
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40]
});

// Map click handler component
function LocationMarker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  return position === null ? null : (
    <Marker position={position}>
      <Popup>Your Location</Popup>
    </Marker>
  );
}

export default function AmbulancePage() {
  const [position, setPosition] = useState(null);
  const [ambulances, setAmbulances] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    pickup_address: '',
    destination_address: '',
    priority: 'non_emergency',
    reason: '',
    notes: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Default center (Maseru, Lesotho)
  const defaultCenter = [-29.3167, 27.4833];

  useEffect(() => {
    fetchAvailableAmbulances();
    getCurrentLocation();
  }, []);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setPosition({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          });
        },
        (err) => {
          console.error('Error getting location:', err);
          setPosition({ lat: defaultCenter[0], lng: defaultCenter[1] });
        }
      );
    } else {
      setPosition({ lat: defaultCenter[0], lng: defaultCenter[1] });
    }
  };

  const fetchAvailableAmbulances = async () => {
    try {
      const response = await axiosInstance.get('/api/ambulances/available');
      setAmbulances(response.data.ambulances);
    } catch (error) {
      console.error('Error fetching ambulances:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRequestAmbulance = () => {
    if (!position) {
      setError('Please set your pickup location on the map');
      return;
    }
    setShowModal(true);
    setError('');
    setSuccess('');
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const requestData = {
        pickup_latitude: position.lat,
        pickup_longitude: position.lng,
        pickup_address: formData.pickup_address,
        destination_address: formData.destination_address,
        priority: formData.priority,
        reason: formData.reason,
        notes: formData.notes,
      };

      await axiosInstance.post('/api/ambulance-requests', requestData);
      setSuccess('Ambulance request submitted successfully! A driver will respond shortly.');
      
      setTimeout(() => {
        setShowModal(false);
        setFormData({
          pickup_address: '',
          destination_address: '',
          priority: 'non_emergency',
          reason: '',
          notes: ''
        });
      }, 2000);
    } catch (error) {
      console.error('Error submitting request:', error);
      setError(error.response?.data?.message || 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ambulance-dashboard">
      <h1 className="page-title">Request Ambulance</h1>
      <p className="page-subtitle">
        Click on the map to set your pickup location or use your current location
      </p>

      {error && !showModal && <div className="alert alert-error">{error}</div>}

      {/* Request Ambulance button */}
      <div className='ambulance-btn'>
        <button onClick={handleRequestAmbulance} className="btn-request-ambulance">
          Request Ambulance
        </button>
        <button onClick={getCurrentLocation} className="btn-get-location">
           Current Location
        </button>
      </div>

      {/* Leaflet js map */}
      <div className='map-container'>
        {position && (
          <MapContainer 
            center={[position.lat, position.lng]} 
            zoom={13} 
            style={{ height: '500px', width: '100%', borderRadius: '8px' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            <LocationMarker position={position} setPosition={setPosition} />
            
            {/* Show available ambulances */}
            {ambulances.map((ambulance) => (
              <Marker
                key={ambulance.id}
                position={[ambulance.current_latitude, ambulance.current_longitude]}
                icon={ambulanceIcon}
              >
                <Popup>
                  <strong>{ambulance.registration_number}</strong><br />
                  {ambulance.vehicle_model}<br />
                  Driver: {ambulance.driver_name}<br />
                  Status: {ambulance.status}
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}
      </div>

      {position && (
        <div className="coordinates-display">
          <p><strong>Selected Location:</strong></p>
          <p>Latitude: {position.lat.toFixed(6)}</p>
          <p>Longitude: {position.lng.toFixed(6)}</p>
        </div>
      )}

      {/* Request Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Request Ambulance</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>
                &times;
              </button>
            </div>

            <div className="modal-body">
              {error && <div className="alert alert-error">{error}</div>}
              {success && <div className="alert alert-success">{success}</div>}

              <form onSubmit={handleSubmitRequest}>
                <div className="form-field">
                  <label>Priority <span className="required">*</span></label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="non_emergency">Non-Emergency</option>
                    <option value="emergency">Emergency</option>
                  </select>
                </div>

                <div className="form-field">
                  <label>Pickup Address</label>
                  <input
                    type="text"
                    name="pickup_address"
                    value={formData.pickup_address}
                    onChange={handleInputChange}
                    placeholder="Enter pickup address (optional)"
                  />
                </div>

                <div className="form-field">
                  <label>Destination Address</label>
                  <input
                    type="text"
                    name="destination_address"
                    value={formData.destination_address}
                    onChange={handleInputChange}
                    placeholder="E.g., Queen Mamohato Memorial Hospital"
                  />
                </div>

                <div className="form-field">
                  <label>Reason for Request</label>
                  <textarea
                    name="reason"
                    value={formData.reason}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="Describe the medical situation..."
                  />
                </div>

                <div className="form-field">
                  <label>Additional Notes</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows="2"
                    placeholder="Any additional information..."
                  />
                </div>

                <div className="modal-actions">
                  <button 
                    type="button" 
                    className="btn-secondary" 
                    onClick={() => setShowModal(false)}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn-submit"
                    disabled={loading}
                  >
                    {loading ? 'Submitting...' : 'Submit Request'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}