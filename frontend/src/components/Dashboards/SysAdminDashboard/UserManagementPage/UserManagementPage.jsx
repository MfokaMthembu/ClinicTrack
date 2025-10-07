import './UserManagementPage.css';
import { useNavigate } from 'react-router-dom';
import '../../../Layouts/AdminLayout/AdminLayout.css';
import './UserManagementPage.css';
import UserList from './ManageUsers/UserList';
import { useState } from 'react';
import axiosInstance from '../../../../services/axios';

export default function UserManagementPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState([]);

  const handleSearch = async (searchTerm) => {
    if (!searchTerm.trim()) return;
    try {
      const res = await axiosInstance.get(`/api/users/search?query=${searchTerm}`);
      setUsers(res.data);
    } catch (err) {
      console.error("Error searching users:", err.response?.data || err.message);
    }
  };



  return (
    <div className="admin-dashboard">
      <h1 className="page-title">User & Role Management</h1>
      <p>Manage users, assign roles, and handle permissions here.</p>

      {/* User list table */}
      <div className='user-list-container'>
        <UserList 
        users={users} 
        search={query}
        />
      </div>
    </div>
  );
}
