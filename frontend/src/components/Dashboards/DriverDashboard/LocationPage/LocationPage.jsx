import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import axiosInstance from '../../../../services/axios';
import 'leaflet/dist/leaflet.css';
import './LocationPage.css';

// Fix marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Location marker component
function LocationMarker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  return position === null ? null : (
    <Marker position={position}>
      <Popup>Your Ambulance Location</Popup>
    </Marker>
  );
}

export default function LocationPage() {
  const [ambulance, setAmbulance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showUpdateLocationModal, setShowUpdateLocationModal] = useState(false);
  const [position, setPosition] = useState(null);
  const [formData, setFormData] = useState({
    registration_number: '',
    vehicle_model: '',
    vehicle_type: 'basic'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const defaultCenter = [-29.3167, 27.4833]; // Maseru

  useEffect(() => {
    fetchAmbulance();
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

  const fetchAmbulance = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/api/driver/ambulance');
      setAmbulance(response.data.ambulance);
      
      if (response.data.ambulance?.current_latitude && response.data.ambulance?.current_longitude) {
        setPosition({
          lat: response.data.ambulance.current_latitude,
          lng: response.data.ambulance.current_longitude
        });
      }
    } catch (error) {
      console.error('Error fetching ambulance:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRegisterAmbulance = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await axiosInstance.post('/api/driver/ambulance/register', formData);
      setSuccess('Ambulance registered successfully!');
      
      setTimeout(() => {
        setShowRegisterModal(false);
        fetchAmbulance();
        setFormData({
          registration_number: '',
          vehicle_model: '',
          vehicle_type: 'basic'
        });
      }, 2000);
    } catch (error) {
      console.error('Error registering ambulance:', error);
      setError(error.response?.data?.message || 'Failed to register ambulance');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateLocation = async () => {
    if (!position) {
      setError('Please select a location on the map');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await axiosInstance.post('/api/driver/ambulance/update-location', {
        latitude: position.lat,
        longitude: position.lng
      });
      setSuccess('Location updated successfully!');
      
      setTimeout(() => {
        setShowUpdateLocationModal(false);
        fetchAmbulance();
      }, 2000);
    } catch (error) {
      console.error('Error updating location:', error);
      setError(error.response?.data?.message || 'Failed to update location');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    try {
      const response = await axiosInstance.post('/api/driver/ambulance/toggle-status');
      setSuccess(response.data.message);
      fetchAmbulance();
    } catch (error) {
      console.error('Error toggling status:', error);
      setError(error.response?.data?.message || 'Failed to toggle status');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      available: '#28a745',
      on_duty: '#dc3545',
      maintenance: '#ffc107',
      offline: '#6c757d'
    };
    return colors[status] || '#6c757d';
  };

  return (
    <div className="location-dashboard">
      <h1 className="page-title">Manage My Ambulance</h1>
      <p className="page-subtitle">Register and manage your ambulance vehicle</p>

      {loading && !ambulance ? (
        <p className="loading-text">Loading...</p>
      ) : !ambulance ? (
        <div className="no-ambulance">
          <div className="no-ambulance-content">
            <h2> No Ambulance Registered</h2>
            <p>You need to register an ambulance to start accepting requests</p>
            <button 
              className="btn-register"
              onClick={() => setShowRegisterModal(true)}
            >
              Register Ambulance
            </button>
          </div>
        </div>
      ) : (
        <div className="locations-grid">
          <div className="location-card">
            <div className="card-header">
              <h2> {ambulance.registration_number}</h2>
              <span 
                className="status-badge"
                style={{ backgroundColor: getStatusColor(ambulance.status) }}
              >
                {ambulance.status.toUpperCase()}
              </span>
            </div>

            <div className="card-body"> 
              <div className="location-info">
                <strong>Vehicle Model:</strong>
                <span>{ambulance.vehicle_model || 'N/A'}</span>
              </div>

              <div className="location-info">
                <strong>Vehicle Type:</strong>
                <span className="vehicle-type">{ambulance.vehicle_type.toUpperCase()}</span>
              </div>

              {ambulance.current_latitude && ambulance.current_longitude && (
                <div>
                  <div className="location-info">
                    <strong>Current Location:</strong>
                    <span>
                      {ambulance.current_latitude != null ? Number(ambulance.current_latitude).toFixed(4) : "N/A"},
                      {ambulance.current_longitude != null ? Number(ambulance.current_longitude).toFixed(4) : "N/A"}
                    </span>
                  </div>

                  <div className="location-info">
                    <strong>Location Last Updated:</strong>
                    <span>
                      {ambulance.location_updated_at 
                        ? new Date(ambulance.location_updated_at).toLocaleString()
                        : 'Never'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="card-actions">
              <button 
                className="btn-update-location"
                onClick={() => setShowUpdateLocationModal(true)}
              >
                 Update Location
              </button>

              {ambulance.status !== 'on_duty' && (
                <button 
                  className="btn-toggle-status"
                  onClick={handleToggleStatus}
                  style={{ 
                    backgroundColor: ambulance.status === 'available' ? '#6c757d' : '#28a745'
                  }}
                >
                  {ambulance.status === 'available' ? ' Go Offline' : ' Go Online'}
                </button>
              )}
            </div>
          </div>

          {/* Current Location Map */}
          {position && (
            <div className="location-map">
              <h3>Current Location</h3>
              <MapContainer 
                center={[position.lat, position.lng]} 
                zoom={13} 
                style={{ height: '400px', width: '100%', borderRadius: '8px' }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={[position.lat, position.lng]}>
                  <Popup>Your Ambulance Location</Popup>
                </Marker>
              </MapContainer>
            </div>
          )}
        </div>
      )}

      {/* Register Ambulance Modal */}
      {showRegisterModal && (
        <div className="modal-overlay" onClick={() => setShowRegisterModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Register Ambulance</h2>
              <button className="close-btn" onClick={() => setShowRegisterModal(false)}>
                &times;
              </button>
            </div>

            <div className="modal-body">
              {error && <div className="alert alert-error">{error}</div>}
              {success && <div className="alert alert-success">{success}</div>}

              <form onSubmit={handleRegisterAmbulance}>
                <div className="form-field">
                  <label>Registration Number <span className="required">*</span></label>
                  <input
                    type="text"
                    name="registration_number"
                    value={formData.registration_number}
                    onChange={handleInputChange}
                    placeholder="e.g., ABC-1234"
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Vehicle Model</label>
                  <input
                    type="text"
                    name="vehicle_model"
                    value={formData.vehicle_model}
                    onChange={handleInputChange}
                    placeholder="e.g., Mercedes Sprinter"
                  />
                </div>

                <div className="form-field">
                  <label>Vehicle Type <span className="required">*</span></label>
                  <select
                    name="vehicle_type"
                    value={formData.vehicle_type}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="basic">Basic Life Support (BLS)</option>
                    <option value="advanced">Advanced Life Support (ALS)</option>
                    <option value="air">Air Ambulance</option>
                  </select>
                </div>

                <div className="modal-actions">
                  <button 
                    type="button" 
                    className="btn-secondary" 
                    onClick={() => setShowRegisterModal(false)}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn-submit"
                    disabled={loading}
                  >
                    {loading ? 'Registering...' : 'Register Ambulance'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Update Location Modal */}
      {showUpdateLocationModal && position && (
        <div className="modal-overlay" onClick={() => setShowUpdateLocationModal(false)}>
          <div className="modal-container modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Update Ambulance Location</h2>
              <button className="close-btn" onClick={() => setShowUpdateLocationModal(false)}>
                &times;
              </button>
            </div>

            <div className="modal-body">
              {error && <div className="alert alert-error">{error}</div>}
              {success && <div className="alert alert-success">{success}</div>}

              <p className="map-instruction">
                Click on the map to set your current location or use the button below to use your device's GPS
              </p>

              <button className="btn-use-gps" onClick={getCurrentLocation}>
                📍 Use Current GPS Location
              </button>

              <MapContainer 
                center={[position.lat, position.lng]} 
                zoom={13} 
                style={{ height: '400px', width: '100%', borderRadius: '8px', marginTop: '1rem' }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationMarker position={position} setPosition={setPosition} />
              </MapContainer>

              <div className="coordinates-display">
                <p><strong>Selected Location:</strong></p>
                <p>Latitude: {position.lat.toFixed(6)}</p>
                <p>Longitude: {position.lng.toFixed(6)}</p>
              </div>

              <div className="modal-actions">
                <button 
                  type="button" 
                  className="btn-secondary" 
                  onClick={() => setShowUpdateLocationModal(false)}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn-submit"
                  onClick={handleUpdateLocation}
                  disabled={loading}
                >
                  {loading ? 'Updating...' : 'Update Location'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}