import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import axiosInstance from '../../../../services/axios';
import 'leaflet/dist/leaflet.css';
import './ApproveRequest.css';

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons
const patientIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/3774/3774299.png',
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40]
});

const ambulanceIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/2913/2913133.png',
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40]
});

export default function ApproveRequest() {
  const [requests, setRequests] = useState([]);
  const [activeRequest, setActiveRequest] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [ambulances, setAmbulances] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [formData, setFormData] = useState({
    ambulance_id: '',
    rejection_reason: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchPendingRequests();
    fetchActiveRequest();
    fetchAmbulances();
    getCurrentLocation();
  }, []);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCurrentLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          });
        },
        (err) => {
          console.error('Error getting location:', err);
          setCurrentLocation({ lat: -29.3167, lng: 27.4833 }); // Default to Maseru
        }
      );
    }
  };

  const fetchPendingRequests = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/api/driver/ambulance-requests/pending');
      setRequests(response.data.requests);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveRequest = async () => {
    try {
      const response = await axiosInstance.get('/api/driver/ambulance-requests/active');
      setActiveRequest(response.data.request);
    } catch (error) {
      console.error('Error fetching active request:', error);
    }
  };

  const fetchAmbulances = async () => {
    try {
      const response = await axiosInstance.get('/api/ambulances/available');
      setAmbulances(response.data.ambulances);
    } catch (error) {
      console.error('Error fetching ambulances:', error);
    }
  };

  const handleApproveClick = (request) => {
    setSelectedRequest(request);
    setShowApproveModal(true);
    setError('');
    setSuccess('');
  };

  const handleRejectClick = (request) => {
    setSelectedRequest(request);
    setShowRejectModal(true);
    setError('');
    setSuccess('');
  };

  const handleApprove = async (e) => {
    e.preventDefault();
    
    if (!formData.ambulance_id) {
      setError('Please select an ambulance');
      return;
    }

    if (!currentLocation) {
      setError('Unable to get your current location');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await axiosInstance.post(
        `/api/driver/ambulance-requests/${selectedRequest.id}/approve`,
        {
          ambulance_id: formData.ambulance_id,
          current_latitude: currentLocation.lat,
          current_longitude: currentLocation.lng
        }
      );

      setSuccess(`Request approved! ETA: ${response.data.eta_minutes} minutes`);
      
      setTimeout(() => {
        setShowApproveModal(false);
        fetchPendingRequests();
        fetchActiveRequest();
        setFormData({ ambulance_id: '', rejection_reason: '' });
      }, 2000);
    } catch (error) {
      console.error('Error approving request:', error);
      setError(error.response?.data?.message || 'Failed to approve request');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (e) => {
    e.preventDefault();
    
    if (!formData.rejection_reason.trim()) {
      setError('Please provide a rejection reason');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await axiosInstance.post(
        `/api/driver/ambulance-requests/${selectedRequest.id}/reject`,
        { rejection_reason: formData.rejection_reason }
      );

      setSuccess('Request rejected successfully');
      
      setTimeout(() => {
        setShowRejectModal(false);
        fetchPendingRequests();
        setFormData({ ambulance_id: '', rejection_reason: '' });
      }, 2000);
    } catch (error) {
      console.error('Error rejecting request:', error);
      setError(error.response?.data?.message || 'Failed to reject request');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    if (!activeRequest) return;

    try {
      const updateData = {
        status: newStatus,
      };

      if (currentLocation) {
        updateData.current_latitude = currentLocation.lat;
        updateData.current_longitude = currentLocation.lng;
      }

      await axiosInstance.put(
        `/api/driver/ambulance-requests/${activeRequest.id}/status`,
        updateData
      );

      setSuccess(`Status updated to ${newStatus}`);
      fetchActiveRequest();
    } catch (error) {
      console.error('Error updating status:', error);
      setError('Failed to update status');
    }
  };

  const handleViewTracking = (request) => {
    setSelectedRequest(request);
    setShowTrackingModal(true);
  };

  return (
    <div className="request-dashboard">
      <h1 className="page-title">Ambulance Requests Dashboard</h1>
      <p className="page-subtitle">
        View, approve or decline ride requests
      </p>

      {error && !showApproveModal && !showRejectModal && (
        <div className="alert alert-error">{error}</div>
      )}
      {success && !showApproveModal && !showRejectModal && (
        <div className="alert alert-success">{success}</div>
      )}

      {/* Active Request Section */}
      {activeRequest && (
        <div className="active-request-section">
          <h2>🚨 Active Request</h2>
          <div className="active-request-card">
            <div className="request-header">
              <div>
                <h3>Patient: {activeRequest.patient_name} {activeRequest.patient_surname}</h3>
                <span className={`priority-badge ${activeRequest.priority}`}>
                  {activeRequest.priority === 'emergency' ? ' EMERGENCY' : ' NON-EMERGENCY'}
                </span>
              </div>
              <span className={`status-badge ${activeRequest.status}`}>
                {activeRequest.status.toUpperCase()}
              </span>
            </div>

            <div className="request-details">
              <p><strong>Pickup:</strong> {activeRequest.pickup_address || 'See map'}</p>
              <p><strong>Destination:</strong> {activeRequest.destination_address || 'N/A'}</p>
              <p><strong>ETA:</strong> {activeRequest.estimated_time_minutes} minutes</p>
              <p><strong>Distance:</strong> {activeRequest.distance_km} km</p>
            </div>

            <div className="status-actions">
              <button 
                className="btn-status"
                onClick={() => handleUpdateStatus('enroute')}
                disabled={activeRequest.status !== 'assigned'}
              >
                En Route
              </button>
              <button 
                className="btn-status"
                onClick={() => handleUpdateStatus('arrived')}
                disabled={activeRequest.status !== 'enroute'}
              >
                Arrived at Pickup
              </button>
              <button 
                className="btn-status"
                onClick={() => handleUpdateStatus('transporting')}
                disabled={activeRequest.status !== 'arrived'}
              >
                Transporting Patient
              </button>
              <button 
                className="btn-status"
                onClick={() => handleUpdateStatus('delivered')}
                disabled={activeRequest.status !== 'transporting'}
              >
                Delivered
              </button>
              <button 
                className="btn-status btn-complete"
                onClick={() => handleUpdateStatus('completed')}
                disabled={activeRequest.status !== 'delivered'}
              >
                Complete Trip
              </button>
            </div>

            <button 
              className="btn-view-map"
              onClick={() => handleViewTracking(activeRequest)}
            >
              View on Map
            </button>
          </div>
        </div>
      )}

      {/* Pending Requests */}
      <div className="pending-requests-section">
        <h2>Pending Requests ({requests.length})</h2>
        
        {loading ? (
          <p className="loading-text">Loading requests...</p>
        ) : requests.length === 0 ? (
          <div className="no-requests">
            <p>No pending requests at the moment</p>
          </div>
        ) : (
          <div className="requests-grid">
            {requests.map((request) => (
              <div key={request.id} className="request-card">
                <div className="card-header">
                  <div>
                    <h3>Request #{request.id}</h3>
                    <span className={`priority-badge ${request.priority}`}>
                      {request.priority === 'emergency' ? ' EMERGENCY' : ' NON-EMERGENCY'}
                    </span>
                  </div>
                  <span className="request-time">
                    {new Date(request.created_at).toLocaleString()}
                  </span>
                </div>

                <div className="card-body">
                  <div className="patient-info">
                    <strong>Patient:</strong> {request.patient_name} {request.patient_surname}
                  </div>

                  <div className="location-info">
                    <p><strong>Pickup:</strong> {request.pickup_address || 'Location on map'}</p>
                    <p><strong>Destination:</strong> {request.destination_address || 'N/A'}</p>
                  </div>

                  {request.reason && (
                    <div className="reason-box">
                      <strong>Reason:</strong>
                      <p>{request.reason}</p>
                    </div>
                  )}

                  {request.notes && (
                    <div className="notes-box">
                      <strong>Notes:</strong>
                      <p>{request.notes}</p>
                    </div>
                  )}
                </div>

                <div className="card-footer">
                  <button 
                    className="btn-approve"
                    onClick={() => handleApproveClick(request)}
                  >
                     Approve
                  </button>
                  <button 
                    className="btn-reject"
                    onClick={() => handleRejectClick(request)}
                  >
                     Reject
                  </button>
                  <button 
                    className="btn-view"
                    onClick={() => handleViewTracking(request)}
                  >
                     View Map
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Approve Modal */}
      {showApproveModal && selectedRequest && (
        <div className="modal-overlay" onClick={() => setShowApproveModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Approve Request #{selectedRequest.id}</h2>
              <button className="close-btn" onClick={() => setShowApproveModal(false)}>
                &times;
              </button>
            </div>

            <div className="modal-body">
              {error && <div className="alert alert-error">{error}</div>}
              {success && <div className="alert alert-success">{success}</div>}

              <form onSubmit={handleApprove}>
                <div className="form-field">
                  <label>Select Ambulance <span className="required">*</span></label>
                  <select
                    value={formData.ambulance_id}
                    onChange={(e) => setFormData({ ...formData, ambulance_id: e.target.value })}
                    required
                  >
                    <option value="">-- Select Ambulance --</option>
                    {ambulances.map((ambulance) => (
                      <option key={ambulance.id} value={ambulance.id}>
                        {ambulance.registration_number} - {ambulance.vehicle_model} ({ambulance.vehicle_type})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="request-summary">
                  <h4>Request Details</h4>
                  <p><strong>Patient:</strong> {selectedRequest.patient_name} {selectedRequest.patient_surname}</p>
                  <p><strong>Priority:</strong> <span className={`priority-badge ${selectedRequest.priority}`}>
                    {selectedRequest.priority.toUpperCase()}
                  </span></p>
                  <p><strong>Pickup:</strong> {selectedRequest.pickup_address || 'See coordinates'}</p>
                  <p><strong>Destination:</strong> {selectedRequest.destination_address || 'N/A'}</p>
                </div>

                <div className="modal-actions">
                  <button 
                    type="button" 
                    className="btn-secondary" 
                    onClick={() => setShowApproveModal(false)}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn-submit"
                    disabled={loading}
                  >
                    {loading ? 'Approving...' : 'Approve & Assign'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedRequest && (
        <div className="modal-overlay" onClick={() => setShowRejectModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Reject Request #{selectedRequest.id}</h2>
              <button className="close-btn" onClick={() => setShowRejectModal(false)}>
                &times;
              </button>
            </div>

            <div className="modal-body">
              {error && <div className="alert alert-error">{error}</div>}
              {success && <div className="alert alert-success">{success}</div>}

              <form onSubmit={handleReject}>
                <div className="form-field">
                  <label>Reason for Rejection <span className="required">*</span></label>
                  <textarea
                    value={formData.rejection_reason}
                    onChange={(e) => setFormData({ ...formData, rejection_reason: e.target.value })}
                    rows="4"
                    placeholder="Please provide a reason for rejecting this request..."
                    required
                  />
                </div>

                <div className="modal-actions">
                  <button 
                    type="button" 
                    className="btn-secondary" 
                    onClick={() => setShowRejectModal(false)}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn-submit btn-danger"
                    disabled={loading}
                  >
                    {loading ? 'Rejecting...' : 'Confirm Rejection'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Tracking Modal with Map */}
      {showTrackingModal && selectedRequest && currentLocation && (
        <div className="modal-overlay" onClick={() => setShowTrackingModal(false)}>
          <div className="modal-container modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Request Location - #{selectedRequest.id}</h2>
              <button className="close-btn" onClick={() => setShowTrackingModal(false)}>
                &times;
              </button>
            </div>

            <div className="modal-body">
              <MapContainer 
                center={[selectedRequest.pickup_latitude, selectedRequest.pickup_longitude]} 
                zoom={13} 
                style={{ height: '500px', width: '100%', borderRadius: '8px' }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                {/* Patient Location */}
                <Marker
                  position={[selectedRequest.pickup_latitude, selectedRequest.pickup_longitude]}
                  icon={patientIcon}
                >
                  <Popup>
                    <strong>Patient Pickup Location</strong><br />
                    {selectedRequest.patient_name} {selectedRequest.patient_surname}<br />
                    {selectedRequest.pickup_address}
                  </Popup>
                </Marker>

                {/* Current Location (Ambulance/Driver) */}
                <Marker
                  position={[currentLocation.lat, currentLocation.lng]}
                  icon={ambulanceIcon}
                >
                  <Popup>
                    <strong>Your Current Location</strong><br />
                    Ambulance Driver
                  </Popup>
                </Marker>

                {/* Route Line */}
                <Polyline
                  positions={[
                    [currentLocation.lat, currentLocation.lng],
                    [selectedRequest.pickup_latitude, selectedRequest.pickup_longitude]
                  ]}
                  color="blue"
                  weight={3}
                  opacity={0.7}
                  dashArray="10, 10"
                />

                {/* Destination if available */}
                {selectedRequest.destination_latitude && selectedRequest.destination_longitude && (
                  <>
                    <Marker
                      position={[selectedRequest.destination_latitude, selectedRequest.destination_longitude]}
                    >
                      <Popup>
                        <strong>Destination</strong><br />
                        {selectedRequest.destination_address}
                      </Popup>
                    </Marker>
                    <Polyline
                      positions={[
                        [selectedRequest.pickup_latitude, selectedRequest.pickup_longitude],
                        [selectedRequest.destination_latitude, selectedRequest.destination_longitude]
                      ]}
                      color="green"
                      weight={3}
                      opacity={0.7}
                    />
                  </>
                )}
              </MapContainer>

              <div className="map-legend">
                <div className="legend-item">
                  <span className="legend-icon">
                  
                  </span> Patient Location
                </div>
                <div className="legend-item">
                  <span className="legend-icon">
                  
                  </span> Your Location
                </div>
                {selectedRequest.destination_address && (
                  <div className="legend-item">
                    <span className="legend-icon">
                      
                    </span> Destination
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}