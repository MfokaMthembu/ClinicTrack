import { useState } from "react";
import "./ForgotPasswordForm.css";
import Logo from "/logo-ldf.png";
import axiosInstance from "../../../services/axios";

export default function ForgotPasswordForm() {
  const [step, setStep] = useState("email"); // email → otp → reset
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmed, setConfirmed] = useState("");

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.post("/api/verify-email", { email });
      if (response.data.success) {
        setStep("otp");
      } else {
        alert(response.data.message || "Email not found.");
      }
    } catch (error) {
      console.error(error);
      alert("Error verifying email.");
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.post("/api/verify-otp", { email, otp });
      if (response.data.success) {
        setStep("reset");
      } else {
        alert(response.data.message || "Invalid OTP.");
      }
    } catch (error) {
      console.error(error);
      alert("Error verifying OTP.");
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    if (password !== confirmed) {
      alert("Passwords do not match.");
      return;
    }

    try {
      const response = await axiosInstance.post("/api/reset-password", {
        email,
        password,
      });
      if (response.data.success) {
        alert("Password reset successful!");
        setStep("email");
        setEmail("");
        setOtp("");
        setPassword("");
        setConfirmed("");
      } else {
        alert(response.data.message || "Failed to reset password.");
      }
    } catch (error) {
      console.error(error);
      alert("Error resetting password.");
    }
  };

  return (
    <div className="forgotpassword-container">
      <div className="forgotpassword-card">
        <div className="logo-container">
          <img src={Logo} alt="LDF logo" className="ldf-logo" />
        </div>

        <h2 className="forgotpassword-title">Reset Password</h2>
        <p className="forgotpassword-subtitle">
          {step === "email" && "Please enter your email address to continue"}
          {step === "otp" && "Enter the OTP sent to your email"}
          {step === "reset" && "Enter your new password"}
        </p>

        {step === "email" && (
          <form className="forgotpassword-form" onSubmit={handleEmailSubmit}>
            <label className="forgotpassword-field">
              <span className="forgotpassword-text">Email</span>
              <input
                type="email"
                name="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>
            <button type="submit" className="forgotpassword-btn">
              Verify
            </button>
          </form>
        )}

        {step === "otp" && (
          <form className="forgotpassword-form" onSubmit={handleOtpSubmit}>
            <label className="forgotpassword-field">
              <span className="forgotpassword-text">OTP</span>
              <input
                type="number"
                name="otp"
                placeholder="Enter your OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
              />
            </label>
            <button type="submit" className="forgotpassword-btn">
              Verify OTP
            </button>
          </form>
        )}

        {step === "reset" && (
          <form className="forgotpassword-form" onSubmit={handlePasswordReset}>
            <label className="forgotpassword-field">
              <span className="forgotpassword-text">Password</span>
              <input
                type="password"
                name="passwd"
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </label>

            <label className="forgotpassword-field">
              <span className="forgotpassword-text">Confirm Password</span>
              <input
                type="password"
                name="confirmed"
                placeholder="Confirm new password"
                value={confirmed}
                onChange={(e) => setConfirmed(e.target.value)}
                required
              />
            </label>

            <button type="submit" className="forgotpassword-btn">
              Reset Password
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
