import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import axiosInstance from '../../../../services/axios';
import echo from '../../../../services/echo';
import 'leaflet/dist/leaflet.css';
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
      <Popup>Your Pickup Location</Popup>
    </Marker>
  );
}

export default function AmbulancePage() {
  const [position, setPosition] = useState(null);
  const [ambulances, setAmbulances] = useState([]);
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(true);
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
    initializeLocation();

    // Subscribe to real-time ambulance location updates
    const channel = echo.channel('ambulances');
    
    channel.listen('.location.updated', (event) => {
      console.log('🚑 Ambulance location updated:', event);
      
      setAmbulances(prev => {
        const index = prev.findIndex(a => a.id === event.ambulance_id);
        
        if (index !== -1) {
          const updated = [...prev];
          updated[index] = {
            ...updated[index],
            current_latitude: event.latitude,
            current_longitude: event.longitude,
            location_updated_at: event.location_updated_at,
            status: event.status,
            driver_name: event.driver_name,
          };
          return updated;
        } else {
          // New ambulance came online
          fetchAvailableAmbulances();
          return prev;
        }
      });
    });

    // Cleanup on unmount
    return () => {
      echo.leaveChannel('ambulances');
    };
  }, []);

  const initializeLocation = () => {
    if (!('geolocation' in navigator)) {
      console.error('Geolocation not supported');
      setPosition({ lat: defaultCenter[0], lng: defaultCenter[1] });
      setLocationLoading(false);
      setError('⚠️ Your browser does not support geolocation. Using default location (Maseru).');
      return;
    }

    // Check permission status
    navigator.permissions.query({ name: 'geolocation' })
      .then((result) => {
        console.log('Geolocation permission:', result.state);
        
        if (result.state === 'granted' || result.state === 'prompt') {
          getCurrentLocation();
        } else {
          // Permission denied
          setPosition({ lat: defaultCenter[0], lng: defaultCenter[1] });
          setLocationLoading(false);
          setError('📍 Location access denied. Please enable location in your browser settings, or click on the map to set your location.');
        }
      })
      .catch((err) => {
        console.error('Permission check error:', err);
        getCurrentLocation(); // Try anyway
      });
  };

  const getCurrentLocation = () => {
    setLocationLoading(true);
    setError('');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        console.log('✅ Got location:', pos.coords);
        setPosition({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        });
        setLocationLoading(false);
      },
      (err) => {
        console.error('❌ Geolocation error:', err);
        
        // Fallback to default location
        setPosition({ lat: defaultCenter[0], lng: defaultCenter[1] });
        setLocationLoading(false);
        
        // User-friendly error messages
        let errorMessage = '';
        switch(err.code) {
          case err.PERMISSION_DENIED:
            errorMessage = '📍 Location permission denied. Click on the map to set your pickup location manually.';
            break;
          case err.POSITION_UNAVAILABLE:
            errorMessage = '⚠️ Location unavailable. Using default location (Maseru). Click on the map to adjust.';
            break;
          case err.TIMEOUT:
            errorMessage = '⏱️ Location request timed out. Using default location. Click "Current Location" to retry.';
            break;
          default:
            errorMessage = '⚠️ Unable to get your location. Using default location (Maseru).';
        }
        setError(errorMessage);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000, // 10 seconds
        maximumAge: 0
      }
    );
  };

  const fetchAvailableAmbulances = async () => {
    try {
      const response = await axiosInstance.get('/api/ambulances/available');
      setAmbulances(response.data.ambulances);
      console.log('📋 Loaded', response.data.ambulances.length, 'ambulances');
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
      setError('⚠️ Please set your pickup location on the map first');
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
      setSuccess('✅ Ambulance request submitted successfully! A driver will respond shortly.');
      
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
      setError(error.response?.data?.message || '❌ Failed to submit request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ambulance-dashboard">
      <h1 className="page-title">🚑 Request Ambulance</h1>
      <p className="page-subtitle">
        {ambulances.length > 0 && (
          <span className="live-indicator">
            🔴 Live Tracking {ambulances.length} {ambulances.length === 1 ? 'ambulance' : 'ambulances'}
          </span>
        )}
      </p>

      {error && !showModal && (
        <div className="alert alert-warning">
          {error}
          {error.includes('permission') || error.includes('timeout') ? (
            <button 
              onClick={getCurrentLocation} 
              className="btn-retry"
              style={{ 
                marginLeft: '10px', 
                padding: '6px 12px',
                backgroundColor: '#ffc107',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              🔄 Try Again
            </button>
          ) : null}
        </div>
      )}

      {/* Action Buttons */}
      <div className='ambulance-btn'>
        <button 
          onClick={handleRequestAmbulance} 
          className="btn-request-ambulance"
          disabled={!position || locationLoading}
        >
          🚨 Request Ambulance
        </button>
        <button 
          onClick={getCurrentLocation} 
          className="btn-get-location"
          disabled={locationLoading}
        >
          {locationLoading ? '⏳ Getting Location...' : '📍 Use Current Location'}
        </button>
      </div>

      {/* Map Container */}
      <div className='map-container'>
        {locationLoading ? (
          <div className="loading-map" style={{ 
            height: '500px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            backgroundColor: '#f5f5f5',
            borderRadius: '8px'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div className="spinner" style={{
                border: '4px solid #f3f3f3',
                borderTop: '4px solid #3498db',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 16px'
              }}></div>
              <p style={{ color: '#666' }}>📍 Getting your location...</p>
            </div>
          </div>
        ) : position ? (
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
            
            {/* Show available ambulances with REAL-TIME updates */}
            {ambulances.map((ambulance) => (
              <Marker
                key={ambulance.id}
                position={[ambulance.current_latitude, ambulance.current_longitude]}
                icon={ambulanceIcon}
              >
                <Popup>
                  <div style={{ minWidth: '200px' }}>
                    <strong style={{ fontSize: '16px' }}>🚑 {ambulance.registration_number}</strong><br />
                    <hr style={{ margin: '8px 0' }} />
                    <strong>Model:</strong> {ambulance.vehicle_model || 'N/A'}<br />
                    <strong>Type:</strong> {ambulance.vehicle_type?.toUpperCase()}<br />
                    <strong>Driver:</strong> {ambulance.driver_name}<br />
                    <strong>Status:</strong> <span style={{ 
                      color: ambulance.status === 'available' ? 'green' : 'orange',
                      fontWeight: 'bold'
                    }}>
                      {ambulance.status.toUpperCase()}
                    </span><br />
                    <small style={{ color: '#666' }}>
                      Updated: {new Date(ambulance.location_updated_at).toLocaleTimeString()}
                    </small>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        ) : (
          <div style={{ 
            height: '500px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            backgroundColor: '#f5f5f5',
            borderRadius: '8px'
          }}>
            <p style={{ color: '#666' }}>⚠️ Unable to load map. Please refresh the page.</p>
          </div>
        )}
      </div>

      {/* Coordinates Display */}
      {position && (
        <div className="coordinates-display">
          <p><strong>📍 Selected Pickup Location:</strong></p>
          <p>Latitude: {position.lat.toFixed(6)}</p>
          <p>Longitude: {position.lng.toFixed(6)}</p>
          {ambulances.length > 0 && (
            <p className="live-indicator">
              🔴 Tracking {ambulances.length} live {ambulances.length === 1 ? 'ambulance' : 'ambulances'}
            </p>
          )}
        </div>
      )}

      {/* Request Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>🚑 Request Ambulance</h2>
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
                    <option value="emergency">🚨 Emergency</option>
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
                    {loading ? '⏳ Submitting...' : '✅ Submit Request'}
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