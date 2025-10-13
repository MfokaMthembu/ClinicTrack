import { useNavigate } from 'react-router-dom';
import '../../../Layouts/AdminLayout/AdminLayout.css';
import './InventoryPage.css';
import { useState } from 'react';
import AddBtn from "../../../../assets/images/icons8-add-50.png";
import InventoryList from './ManageInventory/InventoryList';
import AddMedicineForm from './ManageInventory/AddMedicineForm';
import axiosInstance from '../../../../services/axios';

export default function InventoryPage() {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Open modal 
  const handleAddMedicine = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="inventory-dashboard">
      <h1 className="page-title"> Inventory Management </h1>
      <p>Manage your medical inventory here.</p>
      <div className="right-controls">
        <button className="add-btn" onClick={handleAddMedicine}>
          <img src={AddBtn} alt="Add New Medicine" />
          Add Medicine
        </button>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New Medicine</h2>
              <button className="close-btn" onClick={handleCloseModal}>
                &times;
              </button>
            </div>
            <div className="modal-body">
              <AddMedicineForm />
            </div>
          </div>
        </div>
      )}

      {/* Inventory list table */}
      <div className='medicine-list-container'>
        <InventoryList />
      </div>
    </div>
  );
}