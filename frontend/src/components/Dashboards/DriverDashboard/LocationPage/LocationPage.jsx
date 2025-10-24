import React, { useState, useEffect, useRef } from 'react';
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
  const [locationLoading, setLocationLoading] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showUpdateLocationModal, setShowUpdateLocationModal] = useState(false);
  const [position, setPosition] = useState(null);
  const [isTracking, setIsTracking] = useState(false);
  const [formData, setFormData] = useState({
    registration_number: '',
    vehicle_model: '',
    vehicle_type: 'basic'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const trackingIntervalRef = useRef(null);
  const defaultCenter = [-29.3167, 27.4833];

  useEffect(() => {
    fetchAmbulance();
    initializeLocation();

    // Cleanup tracking on unmount
    return () => {
      if (trackingIntervalRef.current) {
        clearInterval(trackingIntervalRef.current);
      }
    };
  }, []);

  // Auto-send location updates when tracking is enabled
  useEffect(() => {
    if (isTracking && position && ambulance) {
      // Send location immediately
      sendLocationUpdate(position);

      // Then send every 10 seconds
      trackingIntervalRef.current = setInterval(() => {
        getCurrentLocation(true); // Silent update
      }, 10000); // 10 seconds

      return () => {
        if (trackingIntervalRef.current) {
          clearInterval(trackingIntervalRef.current);
        }
      };
    } else {
      if (trackingIntervalRef.current) {
        clearInterval(trackingIntervalRef.current);
      }
    }
  }, [isTracking, ambulance]);

  // Send location update whenever position changes during tracking
  useEffect(() => {
    if (isTracking && position && ambulance) {
      sendLocationUpdate(position);
    }
  }, [position]);

  const initializeLocation = () => {
    if (!('geolocation' in navigator)) {
      console.error('Geolocation not supported');
      setPosition({ lat: defaultCenter[0], lng: defaultCenter[1] });
      setError('Your device does not support GPS tracking.');
      return;
    }

    // Check permission
    navigator.permissions.query({ name: 'geolocation' })
      .then((result) => {
        if (result.state === 'granted' || result.state === 'prompt') {
          getCurrentLocation();
        } else {
          setPosition({ lat: defaultCenter[0], lng: defaultCenter[1] });
          setError('Location permission denied. Please enable GPS in your device settings.');
        }
      })
      .catch((err) => {
        console.error('Permission check error:', err);
        getCurrentLocation();
      });
  };

  const sendLocationUpdate = async (pos) => {
    try {
      await axiosInstance.post('/api/driver/ambulance/update-location', {
        latitude: pos.lat,
        longitude: pos.lng
      });
      console.log('Location sent:', pos.lat.toFixed(6), pos.lng.toFixed(6));
    } catch (error) {
      console.error('Error sending location:', error);
      if (isTracking) {
        setError('Failed to send location update. Check your internet connection.');
      }
    }
  };

  const getCurrentLocation = (silent = false) => {
    if (!navigator.geolocation) {
      if (!silent) {
        setError('Geolocation not supported on this device');
      }
      return;
    }

    if (!silent) {
      setLocationLoading(true);
      setError('');
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        console.log('GPS location:', pos.coords.latitude.toFixed(6), pos.coords.longitude.toFixed(6));
        setPosition({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        });
        if (!silent) {
          setLocationLoading(false);
          setSuccess('Location updated!');
          setTimeout(() => setSuccess(''), 2000);
        }
      },
      (err) => {
        console.error('❌ GPS error:', err);
        if (!silent) {
          setLocationLoading(false);
          
          // Fallback to default if no position yet
          if (!position) {
            setPosition({ lat: defaultCenter[0], lng: defaultCenter[1] });
          }
          
          let errorMessage = '';
          switch(err.code) {
            case err.PERMISSION_DENIED:
              errorMessage = 'GPS permission denied. Please enable location access in your device settings.';
              break;
            case err.POSITION_UNAVAILABLE:
              errorMessage = 'GPS signal unavailable. Make sure you\'re outdoors or near a window.';
              break;
            case err.TIMEOUT:
              errorMessage = 'GPS timeout. Please try again.';
              break;
            default:
              errorMessage = 'Unable to get GPS location.';
          }
          setError(errorMessage);
        }
      },
      {
        enableHighAccuracy: true,
        timeout: silent ? 5000 : 15000,
        maximumAge: 0
      }
    );
  };

  const toggleTracking = () => {
    if (!ambulance) {
      setError('Register an ambulance first');
      return;
    }

    if (ambulance.status === 'offline') {
      setError('Please go online first before enabling live tracking');
      return;
    }

    if (!position) {
      setError('Waiting for GPS location...');
      getCurrentLocation();
      return;
    }

    setIsTracking(!isTracking);
    setSuccess(isTracking ? 'Live tracking stopped' : 'Live tracking started');
    
    setTimeout(() => setSuccess(''), 3000);
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
      setError(error.response?.data?.message || '❌ Failed to register ambulance');
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
    setError('');
    setSuccess('');
    
    try {
      const response = await axiosInstance.post('/api/driver/ambulance/toggle-status');
      setSuccess(' ' + response.data.message);
      
      setTimeout(() => setSuccess(''), 3000);
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
      <h1 className="page-title">🚑 Manage My Ambulance</h1>
      <p className="page-subtitle">
        {isTracking && <span className="live-indicator"> Live Tracking Active - Sending location every 10 seconds</span>}
      </p>

      {error && (
        <div className="alert alert-error">
          {error}
          {(error.includes('GPS') || error.includes('timeout')) && (
            <button 
              onClick={() => getCurrentLocation()} 
              className="btn-retry"
              style={{ 
                marginLeft: '10px', 
                padding: '6px 12px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Retry
            </button>
          )}
        </div>
      )}
      
      {success && <div className="alert alert-success">{success}</div>}

      {loading && !ambulance ? (
        <div className="loading-text" style={{ textAlign: 'center', padding: '40px' }}>
          <div className="spinner" style={{
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #3498db',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <p>Loading ambulance data...</p>
        </div>
      ) : !ambulance ? (
        <div className="no-ambulance">
          <div className="no-ambulance-content">
            <h2>No Ambulance Registered</h2>
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
              <h2>{ambulance.registration_number}</h2>
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
                <>
                  <div className="location-info">
                    <strong>Current Location:</strong>
                    <span>
                      {Number(ambulance.current_latitude).toFixed(4)}, {Number(ambulance.current_longitude).toFixed(4)}
                    </span>
                  </div>

                  <div className="location-info">
                    <strong>Last Updated:</strong>
                    <span>
                      {ambulance.location_updated_at 
                        ? new Date(ambulance.location_updated_at).toLocaleString()
                        : 'Never'}
                    </span>
                  </div>
                </>
              )}
            </div>

            <div className="card-actions">
              {/* Live Tracking Toggle */}
              {ambulance.status !== 'offline' && (
                <button 
                  className={`btn-tracking ${isTracking ? 'active' : ''}`}
                  onClick={toggleTracking}
                  style={{ 
                    backgroundColor: isTracking ? '#dc3545' : '#28a745',
                    color: 'white',
                    marginBottom: '10px',
                    width: '100%'
                  }}
                >
                  {isTracking ? 'Stop Live Tracking' : 'Start Live Tracking'}
                </button>
              )}

              <button 
                className="btn-update-location"
                onClick={() => setShowUpdateLocationModal(true)}
              >
                Update Location Manually
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
          {position ? (
            <div className="location-map">
              <h3>
                Current Location 
                {isTracking && <span style={{ color: '#dc3545' }}> 🔴</span>}
              </h3>
              <MapContainer 
                center={[position.lat, position.lng]} 
                zoom={15} 
                style={{ height: '400px', width: '100%', borderRadius: '8px' }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={[position.lat, position.lng]}>
                  <Popup>
                    <strong>Your Ambulance</strong><br />
                    {ambulance.registration_number}<br />
                    {isTracking && <span style={{ color: '#dc3545' }}><strong> Live Tracking</strong></span>}
                  </Popup>
                </Marker>
              </MapContainer>
              
              {isTracking && (
                <p style={{ 
                  marginTop: '10px', 
                  color: '#28a745', 
                  fontWeight: 'bold',
                  textAlign: 'center'
                }}>
                  Sending location updates every 10 seconds
                </p>
              )}
            </div>
          ) : (
            <div className="location-map">
              <div style={{ 
                height: '400px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                backgroundColor: '#f5f5f5',
                borderRadius: '8px'
              }}>
                <div style={{ textAlign: 'center' }}>
                  {locationLoading ? (
                    <>
                      <div className="spinner" style={{
                        border: '4px solid #f3f3f3',
                        borderTop: '4px solid #3498db',
                        borderRadius: '50%',
                        width: '40px',
                        height: '40px',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto 16px'
                      }}></div>
                      <p style={{ color: '#666' }}>📍 Getting GPS location...</p>
                    </>
                  ) : (
                    <>
                      <p style={{ color: '#666', marginBottom: '16px' }}> No GPS location available</p>
                      <button 
                        onClick={() => getCurrentLocation()}
                        style={{
                          padding: '10px 20px',
                          backgroundColor: '#28a745',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '16px'
                        }}
                      >
                        Get Current Location
                      </button>
                    </>
                  )}
                </div>
              </div>
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
                    {loading ? 'Registering...' : ' Register Ambulance'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Update Location Modal */}
      {showUpdateLocationModal && (
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

              <p className="map-instruction" style={{ 
                backgroundColor: '#e7f3ff', 
                padding: '12px', 
                borderRadius: '6px',
                marginBottom: '16px'
              }}>
                Click on the map to set your location, or use the button below to get your device's GPS location
              </p>

              <button 
                className="btn-use-gps" 
                onClick={() => getCurrentLocation()}
                disabled={locationLoading}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  marginBottom: '16px'
                }}
              >
                {locationLoading ? 'Getting GPS Location...' : 'Use Current GPS Location'}
              </button>

              {position ? (
                <MapContainer 
                  center={[position.lat, position.lng]} 
                  zoom={13} 
                  style={{ height: '400px', width: '100%', borderRadius: '8px' }}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <LocationMarker position={position} setPosition={setPosition} />
                </MapContainer>
              ) : (
                <div style={{ 
                  height: '400px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  backgroundColor: '#f5f5f5',
                  borderRadius: '8px'
                }}>
                  <p style={{ color: '#666' }}>
                    {locationLoading ? 'Getting location...' : 'Click "Use Current GPS Location" to set your position'}
                  </p>
                </div>
              )}

              {position && (
                <div className="coordinates-display" style={{ marginTop: '16px' }}>
                  <p><strong>Selected Location:</strong></p>
                  <p>Latitude: {position.lat.toFixed(6)}</p>
                  <p>Longitude: {position.lng.toFixed(6)}</p>
                </div>
              )}

              <div className="modal-actions" style={{ marginTop: '20px' }}>
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
                  disabled={loading || !position}
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