import { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import Logo from "/logo-ldf.png";
import Search from "../../../assets/images/icons8-search-48.png";
import Notify from "../../../assets/images/icons8-notification-48.png";
import dashboard from "../../../assets/images/icons8-home-48.png";
import Appointments from "../../../assets/images/icons8-appointment-time-48.png";
import Ambulance from "../../../assets/images/icons8-ambulance-48.png";
import Prescriptions from "../../../assets/images/icons8-pharmacy-100.png";
import Notifications from "../../../assets/images/icons8-notification-48.png";
import "./PatientLayout.css";

export default function PatientLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  // Sidebar items
  const menuItems = [
    { label: "Dashboard", path: "/patient", icon: dashboard },
    { label: "Appointments", path: "/patient/appointments", icon: Appointments },
    { label: "Ambulance Requests", path: "/patient/ambulance", icon: Ambulance },
    { label: "Prescriptions", path: "/patient/prescriptions", icon: Prescriptions },
    { label: "Notifications", path: "/patient/notifications", icon: Notifications },
  ];

  return (
    <div className="patient-layout">
      {/* HEADER */}
      <header className="header">
        <div className="header-left">
          <button className="menu-toggle" onClick={toggleSidebar}>
            <div className="menu-icon">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </button>

          <div className="logo-section">
            <img src={Logo} alt="LDF Logo" className="logo" />
            <span className="hospital-name">Makoanyane Military Hospital</span>
          </div>
        </div>

        <div className="header-center">
          <div className="search-container">
            <input
              type="text"
              className="search-input"
              placeholder="Search appointments, prescriptions, ambulances..."
            />
            <div className="search-icon">
              <img src={Search} alt="search" />
            </div>
          </div>
        </div>

        <div className="header-right">
          <button className="notification-btn">
            <div className="notification-badge">
              <img src={Notify} alt="notifications" />
            </div>
          </button>

          <div className="user-profile">
            <div className="user-avatar">EA</div>
            <div className="user-info">
              <span className="user-name">Edwell Adolf</span>
              <span className="user-role">Patient</span>
            </div>
          </div>
        </div>
      </header>

      {/* SIDEBAR */}
      <nav className={`sidebar ${sidebarOpen ? "open" : ""}`} id="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-title">Dashboard Menu</div>
          <div className="sidebar-subtitle">Navigation & Quick Access</div>
        </div>

        <div className="sidebar-menu">
          {menuItems.map((item) => (
            <a
              key={item.label}
              onClick={() => {
                navigate(item.path);
                if (window.innerWidth <= 768) closeSidebar();
              }}
              className={`menu-item ${
                location.pathname === item.path ? "active" : ""
              }`}
            >
              <div className="menu-icon-item">
                <img src={item.icon} alt={`${item.label} icon`} />
              </div>
              <span>{item.label}</span>
            </a>
          ))}
        </div>
      </nav>

      {/* OVERLAY */}
      {sidebarOpen && <div className="overlay show" onClick={closeSidebar}></div>}

      {/* MAIN CONTENT */}
      <main
        className={`main-content ${sidebarOpen ? "sidebar-open" : ""}`}
        id="mainContent"
      >
        <Outlet /> {/* 👈 pages load here */}
      </main>
    </div>
  );
}
