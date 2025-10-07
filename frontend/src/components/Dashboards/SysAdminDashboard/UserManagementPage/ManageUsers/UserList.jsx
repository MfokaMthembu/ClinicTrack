import React, { useState, useEffect } from "react";
import axiosInstance from "../../../../../services/axios";
import EditIcon from "../../../../../assets/images/icons8-edit-50.png";
import ApproveIcon from "../../../../../assets/images/icons8-approve-50.png";
import DeleteIcon from "../../../../../assets/images/icons8-delete-50.png";
import DisapproveIcon from "../../../../../assets/images/icons8-disable-50.png";
import Sort from "../../../../../assets/images/icons8-sort-50.png";
import Filter from "../../../../../assets/images/icons8-filter-50.png";
import UpdateForm from "./UpdateForm"; 
import "./UserList.css";

export default function UserList() {
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [filterType, setFilterType] = useState("All");
  const [sortType, setSortType] = useState("Name");

  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const toggleFilter = () => setFilterOpen(!filterOpen);
  const toggleSort = () => setSortOpen(!sortOpen);

  const handleFilterSelect = (type) => {
    setFilterType(type);
    setFilterOpen(false);
  };

  const handleSortSelect = (type) => {
    setSortType(type);
    setSortOpen(false);
  };

  const fetchUsers = async () => {
    try {
      const res = await axiosInstance.get("/api/users");
      setUsers(res.data);
    } catch (err) {
      console.error("Error fetching users:", err.response?.data || err.message);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Open modal and load user
  const handleEdit = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedUser(null);
    setIsModalOpen(false);
  };

  // Update user info (after form submission)
  const handleUserUpdate = async (updatedUser) => {
    try {
      await axiosInstance.put(`/api/users/${updatedUser.id}`, updatedUser);
      alert("User updated successfully");
      setIsModalOpen(false);
      fetchUsers();
    } catch (err) {
      console.error("Error updating user:", err.response?.data || err.message);
    }
  };

  const handleSearch = async () => {
    try {
      if (!query.trim()) return fetchUsers();
      const res = await axiosInstance.get(`/api/users/search?query=${query}`);
      setUsers(res.data);
    } catch (err) {
      console.error("Error searching users:", err.response?.data || err.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await axiosInstance.delete(`/api/users/${id}`);
        alert("User deleted successfully");
        fetchUsers();
      } catch (err) {
        console.error("Error deleting user:", err.response?.data || err.message);
      }
    }
  };

  const handleApprove = async (user) => {
    const details = `
      Confirm approval of this staff account:
      ---------------------------------------
      Name: ${user.name} ${user.surname}
      Email: ${user.email}
      Role (current): ${user.role}
      Status: ${user.status}
    `;
    if (window.confirm(details)) {
      try {
        await axiosInstance.patch(`/api/users/${user.id}/approve`);
        alert("User approved successfully and role assigned");
        fetchUsers();
      } catch (err) {
        console.error("Error approving user:", err.response?.data || err.message);
      }
    }
  };

  const handleDisapprove = async (user) => {
    if (window.confirm(`Disapprove ${user.name} ${user.surname}?`)) {
      try {
        await axiosInstance.patch(`/api/users/${user.id}/disapprove`);
        alert("User disapproved successfully");
        fetchUsers();
      } catch (err) {
        console.error("Error disapproving user:", err.response?.data || err.message);
      }
    }
  };

  return (
    <div className="user-management">
      <div className="search-actions">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="button" className="icon" onClick={handleSearch}>
            &#128269;
          </button>
        </div>

        {/* Filter & Sort */}
        <div className="filter-wrapper">
          <button className="btn" onClick={toggleFilter}>
            <img src={Filter} alt="Filter" className="icon" />
            Filter
          </button>
          {filterOpen && (
            <div className="dropdown-modal">
              <h4>Filter By</h4>
              {["All", "Patient", "Doctor", "Pharmacist", "Ambulance-driver", "Active", "Pending", "Suspended"].map((type) => (
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

        <div className="sort-wrapper">
          <button className="btn" onClick={toggleSort}>
            <img src={Sort} alt="Sort" className="icon" />
            Sort
          </button>
          {sortOpen && (
            <div className="dropdown-modal">
              <h4>Sort By</h4>
              {["Name", "Date Added", "Role", "Status"].map((type) => (
                <label key={type} onClick={() => handleSortSelect(type)}>
                  {type}
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* User Table */}
      <div className="card-table">
        <table className="user-table">
          <thead>
            <tr>
              <th><input type="checkbox" /></th>
              <th>User ID</th>
              <th>Name</th>
              <th>Surname</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? (
              users.map((user) => (
                <tr key={user.id}>
                  <td><input type="checkbox" value={user.id} /></td>
                  <td>{user.id}</td>
                  <td>{user.name || "-"}</td>
                  <td>{user.surname || "-"}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>
                    <span className={`status-badge ${user.status === "active" ? "active" : "inactive"}`}>
                      {user.status}
                    </span>
                  </td>
                  <td>
                    <button className="btn-action" onClick={() => handleEdit(user)}>
                      <img src={EditIcon} alt="Edit" />
                    </button>
                    <button className="btn-action" onClick={() => handleDelete(user.id)}>
                      <img src={DeleteIcon} alt="Delete" />
                    </button>
                    <button className="btn-approve" onClick={() => handleApprove(user)}>
                      <img src={ApproveIcon} alt="Approve" />
                    </button>
                    <button className="btn-disapprove" onClick={() => handleDisapprove(user)}>
                      <img src={DisapproveIcon} alt="Disapprove" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="no-data">No users found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal for Editing */}
      <div className="update-modal">
        {isModalOpen && (
          <UpdateForm
            user={selectedUser}
            onClose={handleCloseModal}
            onUpdate={handleUserUpdate}
          />
        )}
      </div>

    </div>
  );
}
