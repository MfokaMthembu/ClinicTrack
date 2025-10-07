import Logo from "/logo-ldf.png";
import "./Register.css";
import axiosInstance from "../../../services/axios";

export default function Register() {
  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);

    try {
      const response = await axiosInstance.post("/api/register", {
        role: formData.get("role"),
      });

      if (response.data.redirect) {
        window.location.href = response.data.redirect;
      }
    } catch (error) {
      console.error("Registration error:", error.response?.data || error.message);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="logo-container">
          <img src={Logo} alt="LDF logo" className="ldf-logo" />
        </div>

        <h2 className="register-title">Create a New Account</h2>
        <p className="register-subtitle">
          Please select your category to continue with registration
        </p>

        <form className="register-form" onSubmit={handleSubmit} noValidate>
          <label className="register-field">
            <span className="register-text">Are you registering as:</span>
            <select name="role" required>
              <option value="">Select your Role</option>
              <option value="Patient">Patient</option>
              <option value="Staff">Staff</option>
            </select>
          </label>

          <button type="submit" className="register-btn">
            Continue
          </button>
        </form>
      </div>
    </div>
  );
}
