import { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import Logo from "/logo-ldf.png";
import Search from "../../../assets/images/icons8-search-48.png";
import Notify from "../../../assets/images/icons8-notification-48.png";
import dashboard from "../../../assets/images/icons8-home-48.png";
import Availability from "../../../assets/images/icons8-schedule-48.png";
import Approvals from "../../../assets/images/icons8-today-48.png";
import Notes from "../../../assets/images/icons8-making-notes-48.png";
import Schedule from "../../../assets/images/icons8-incoming-call-on-iphone-48.png";
import axiosInstance from "../../../services/axios";
import "./DoctorLayout.css";

export default function DoctorLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState({ name: "", surname: "", role: "" });
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

    // Fetch user info from API
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axiosInstance.get("/api/user/current"); 
        setUser({
          name: response.data.name,
          surname: response.data.surname,
          role: response.data.role,
        });
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    fetchUser();
  }, []);

  // Sidebar items
  const menuItems = [
    { label: "Dashboard", path: "/doctor", icon: dashboard },
    { label: "Availability Scheduling", path: "/doctor/availability", icon: Availability },
    { label: "Appointments Approval", path: "/doctor/approvals", icon: Approvals },
    { label: "Consultation Notes", path: "/doctor/consultation-notes", icon: Notes },
    { label: "On-call Schedule", path: "/doctor/on-call-schedule", icon: Schedule },
  ];

  return (
    <div className="doctor-layout">
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
              placeholder="Search appointments, prescriptions..."
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
            <div className="user-avatar">
              {user.name ? user.name.charAt(0) + user.surname.charAt(0) : "EA"}
            </div>
            <div className="user-info">
              <span className="user-name">
                {user.name} {user.surname}
              </span>
              <span className="user-role">{user.role}</span>
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
        <Outlet /> {/* Render nested routes here */}
      </main>
    </div>
  );
}
