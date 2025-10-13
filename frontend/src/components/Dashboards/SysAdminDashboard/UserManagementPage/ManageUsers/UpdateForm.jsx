import React, { useState, useEffect } from "react";
import axiosInstance from "../../../../../services/axios";
import "./UpdateForm.css";
import Logo from "/logo-ldf.png";

export default function UpdateForm({ userId, onClose, onUpdate }) {
  const [form, setForm] = useState({
    name: "",
    surname: "",
    email: "",
    status: "",
    role: "",
  });

  // Fetch user details from DB (joins patient & employee tables)
  useEffect(() => {
    if (!userId) return;

    const fetchUserDetails = async () => {
      try {
        const res = await axiosInstance.get(`/api/users/${userId}/details`);
        // assuming backend merges related data from both tables
        setForm({
          name: res.data.name || "",
          surname: res.data.surname || "",
          email: res.data.email || "",
          status: res.data.status || "",
          role: res.data.role || "",
        });
      } catch (error) {
        console.error("Error fetching user details:", error);
      }
    };

    fetchUserDetails();
  }, [userId]);

  // ✅ Handle input changes
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // ✅ Handle submit + update user details
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.put(`/api/users/update-user/${userId}`, form);
      alert("User updated successfully");
      if (onUpdate) onUpdate(form);
      onClose();
    } catch (err) {
      console.error("Update failed:", err);
      alert("Update failed, check console for details");
    }
  };

  return (
    <div className="update-container">
      <div className="update-card">
        {/* 🔹 Close Button */}
        <button className="close-btn" onClick={onClose}>
          &times;
        </button>

        {/* 🔹 Logo + Title */}
        <div className="logo-container">
          <img src={Logo} alt="LDF logo" className="ldf-logo" />
        </div>

        <h2 className="update-title">Update Account</h2>
        <p className="update-subtitle">
          Check and Update User Auth info Accordingly
        </p>

        {/* 🔹 Form */}
        <form className="update-form" onSubmit={handleSubmit} noValidate>
          <label className="update-field">
            <span>Name</span>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </label>

          <label className="update-field">
            <span>Surname</span>
            <input
              type="text"
              name="surname"
              value={form.surname}
              onChange={handleChange}
              required
            />
          </label>

          <label className="update-field">
            <span>Email</span>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </label>

          <label className="update-field">
            <span>Status</span>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              required
            >
              <option value="">Select user status</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="pending">Pending</option>
            </select>
          </label>

          <label className="update-field">
            <span>Role</span>
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              required
            >
              <option value="">Select user role</option>
              <option value="admin">System Adminstrator</option>
              <option value="doctor">Doctor</option>
              <option value="patient">Patient</option>
              <option value="pharmacist">Pharmacist</option>
              <option value="ambulance-driver">Ambulance driver</option>
            </select>
          </label>

          <button type="submit" className="update-btn">
            Update
          </button>
        </form>
      </div>
    </div>
  );
}
