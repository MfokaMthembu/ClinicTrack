import React, { useState, useEffect } from "react";
import axiosInstance from "../../../../../services/axios";
import EditIcon from "../../../../../assets/images/icons8-edit-50.png";
import DeleteIcon from "../../../../../assets/images/icons8-delete-50.png";
import Sort from "../../../../../assets/images/icons8-sort-50.png";
import Filter from "../../../../../assets/images/icons8-filter-50.png";
import UpdateMedicineForm from "./UpdateMedicineForm";
import "./InventoryList.css";

export default function InventoryList() {
  const [medicines, setMedicines] = useState([]);
  const [query, setQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMedicineId, setSelectedMedicineId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [filterType, setFilterType] = useState("All");

  useEffect(() => {
    fetchAllMedicines();
  }, []);

  // Fetch all medicines
  const fetchAllMedicines = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/api/medicines');
      setMedicines(response.data.medicines);
    } catch (error) {
      console.error('Error fetching medicines:', error);
    } finally {
      setLoading(false);
    }
  };

  // Search medicines
  const handleSearch = async () => {
    if (!query.trim()) {
      fetchAllMedicines();
      return;
    }

    setLoading(true);
    try {
      const response = await axiosInstance.get('/api/medicines/search', {
        params: { search: query }
      });
      setMedicines(response.data.medicines);
    } catch (error) {
      console.error('Error searching medicines:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Open modal and load medicine
  const handleEdit = (medicineId) => {
    setSelectedMedicineId(medicineId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedMedicineId(null);
  };

  // Update Medicine info (after form submission)
  const handleMedicineUpdate = () => {
    handleCloseModal();
    fetchAllMedicines(); // Refresh the list
  };

  // Delete medicine
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this medicine?')) {
      return;
    }

    try {
      await axiosInstance.delete(`/api/medicines/${id}`);
      alert('Medicine deleted successfully');
      fetchAllMedicines(); // Refresh the list
    } catch (error) {
      console.error('Error deleting medicine:', error);
      alert('Failed to delete medicine');
    }
  };

  // Filter toggle
  const toggleFilter = () => {
    setFilterOpen(!filterOpen);
    setSortOpen(false);
  };

  const handleFilterSelect = (type) => {
    setFilterType(type);
    setFilterOpen(false);
    
    // Apply filter logic here
    if (type === "All") {
      fetchAllMedicines();
    } else {
      // Filter by category
      const filtered = medicines.filter(med => med.category === type);
      setMedicines(filtered);
    }
  };

  // Sort toggle
  const toggleSort = () => {
    setSortOpen(!sortOpen);
    setFilterOpen(false);
  };

  const handleSortSelect = (type) => {
    setSortOpen(false);
    let sorted = [...medicines];

    switch (type) {
      case "Name":
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "Category":
        sorted.sort((a, b) => a.category.localeCompare(b.category));
        break;
      case "Quantity":
        sorted.sort((a, b) => a.quantity - b.quantity);
        break;
      case "Price":
        sorted.sort((a, b) => a.price - b.price);
        break;
      default:
        break;
    }

    setMedicines(sorted);
  };

  return (
    <div className="inventory-management">
      {/* Search and Controls */}
      <div className="search-actions">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by name, generic name, or category..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <button type="button" className="icon" onClick={handleSearch}>
            &#128269;
          </button>
        </div>

        {/* Filter */}
        <div className="filter-wrapper">
          <button className="btn" onClick={toggleFilter}>
            <img src={Filter} alt="Filter" className="icon" />
            Filter
          </button>
          {filterOpen && (
            <div className="dropdown-modal">
              <h4>Filter By Category</h4>
              {[
                "All",
                "Analgesics",
                "Antibiotics",
                "Antidepressents",
                "Antifungals",
                "Hormones",
                "Diuretics",
              ].map((type) => (
                <label key={type}>
                  <input
                    type="radio"
                    checked={filterType === type}
                    onChange={() => handleFilterSelect(type)}
                  />
                  {type}
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Sort */}
        <div className="sort-wrapper">
          <button className="btn" onClick={toggleSort}>
            <img src={Sort} alt="Sort" className="icon" />
            Sort
          </button>
          {sortOpen && (
            <div className="dropdown-modal">
              <h4>Sort By</h4>
              {["Name", "Category", "Quantity", "Price"].map((type) => (
                <label key={type} onClick={() => handleSortSelect(type)}>
                  {type}
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Inventory Table */}
      <div className="card-table">
        {loading ? (
          <p className="loading-text">Loading medicines...</p>
        ) : (
          <table className="inventory-table">
            <thead>
              <tr>
                <th><input type="checkbox" /></th>
                <th>Medicine ID</th>
                <th>Name</th>
                <th>Generic Name</th>
                <th>Category</th>
                <th>Dosage Form</th>
                <th>Strength</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Expiry Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {medicines.length === 0 ? (
                <tr>
                  <td colSpan="11" className="no-data">
                    {query ? 'No medicines found matching your search' : 'No medicine found'}
                  </td>
                </tr>
              ) : (
                medicines.map((med) => (
                  <tr key={med.id}>
                    <td>
                      <input type="checkbox" />
                    </td>
                    <td>{med.id}</td>
                    <td>{med.name}</td>
                    <td>{med.generic_name || 'N/A'}</td>
                    <td>
                      <span className={`category-badge ${med.category?.toLowerCase()}`}>
                        {med.category}
                      </span>
                    </td>
                    <td>{med.dosage_form || 'N/A'}</td>
                    <td>{med.strength || 'N/A'}</td>
                    <td>
                      <span className={`quantity-badge ${med.quantity === 0 ? 'out-of-stock' : med.quantity < 10 ? 'low-stock' : ''}`}>
                        {med.quantity}
                      </span>
                    </td>
                    <td>M{parseFloat(med.price).toFixed(2)}</td>
                    <td>{med.expiry_date || 'N/A'}</td>
                    <td>
                      <button
                        className="btn-action btn-edit"
                        onClick={() => handleEdit(med.id)}
                        title="Edit"
                      >
                        <img src={EditIcon} alt="Edit" />
                      </button>
                      <button
                        className="btn-action btn-delete"
                        onClick={() => handleDelete(med.id)}
                        title="Delete"
                      >
                        <img src={DeleteIcon} alt="Delete" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Update Modal */}
      {isModalOpen && selectedMedicineId && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-container modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Update Medicine</h2>
              <button className="close-btn" onClick={handleCloseModal}>
                &times;
              </button>
            </div>
            <div className="modal-body">
              <UpdateMedicineForm
                medicineId={selectedMedicineId}
                onSuccess={handleMedicineUpdate}
                onCancel={handleCloseModal}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}