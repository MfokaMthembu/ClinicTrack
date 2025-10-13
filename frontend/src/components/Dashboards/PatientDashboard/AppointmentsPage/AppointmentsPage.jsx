import { useState, useEffect } from 'react';
import './AppointmentsPage.css';
import '../../../Layouts/PatientLayout/PatientLayout.css';
import axiosInstance from '../../../../services/axios';
import Appointment from '../../../../assets/images/icons8-appointment-50.png';
import DoctorSchedule from "../../../../assets/images/icons8-schedule-48.png";
import AppointmentsForm from './AppointmentsForm'; 
import AppointmentsList from './AppointmentsList';
import ViewAvailabilityForm from './ViewAvailabilityForm';

export default function AppointmentsPage() {
  const [showModal, setShowModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  
  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);
  const openFormModal = () => setShowFormModal(true); // FIXED: was showFormModal(true)
  const closeFormModal = () => setShowFormModal(false);

  return (
    <div className='patient-dash'>
      <h1 className="page-title">Appointments</h1>
      <p>View and schedule your appointments here.</p>

      <div className='buttons-grid'>
        <div className="button-container">
          <button className='book-btn' onClick={openModal}> 
            <img src={Appointment} alt='Appointments' className='book-img'/>
            <span>Book Appointment</span>
          </button>
        </div>

        <div className="button-container">
          <button className='book-btn' onClick={openFormModal}> 
            <img src={DoctorSchedule} alt='Availability Schedule' className='schedule-img'/>
            <span> View Available Doctors </span>
          </button>
        </div>
      </div>

      {/* Book Appointment Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Schedule An Appointment</h2>
              <button className="close-btn" onClick={closeModal}>
                &times;
              </button>
            </div>
            <div className="modal-body">
              <AppointmentsForm />
            </div>
          </div>
        </div>
      )}

      {/* View Availability Modal */}
      {showFormModal && (
        <div className="modal-overlay" onClick={closeFormModal}>
          <div className="modal-container modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>View Doctor Availability</h2>
              <button className="close-btn" onClick={closeFormModal}>
                &times;
              </button>
            </div>
            <div className="modal-body">
              <ViewAvailabilityForm />
            </div>
          </div>
        </div>
      )}

      {/* List of Appointments in grid layout */}
      <div className="appointments-grid-container">
        <AppointmentsList />
      </div>
    </div>
  );
}