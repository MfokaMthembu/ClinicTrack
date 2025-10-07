import { useState } from 'react'
import Logo from '/logo-ldf.png';
import './UserRegistrationForm.css';
import axiosInstance from '../../../../services/axios';

export default function UserRegisterationForm () {
  const [form, setForm] = useState({
      name: "",
      surname: "",
      dob: "",
      gender: "",
      address: "",
      medical_history: "",
      email: "",
      password: "",
    });
    const [attachment, setAttachment] = useState(null);

    const handleChange = (e) => {
      setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
      e.preventDefault();

      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        formData.append(key, value);
      });
      if (attachment) {
        formData.append("attachment", attachment);
      }

      try {
        const response = await axiosInstance.post("/api/register-patient", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        alert("Patient registered successfully!");
        console.log("Response:", response.data);
        window.location.href = "/login";
      } catch (error) {
        console.error("Registration failed:", error.response?.data || error.message);
        alert("Error: " + (error.response?.data?.message || "Registration failed"));
      }
  };

    return (
       <div className="reg-wrap">
             <div className="logo-container">
               <img src={Logo} alt="LDF logo" />
             </div>
             <div className="reg-card">
               <div className="reg-header">
                 <p className="reg-sub"> Create a new Patient Account</p>
               </div>
       
               <form className="reg-form" onSubmit={handleSubmit} noValidate>

                 <label className="reg-field">
                   <span className="reg-text">Name</span>
                   <input
                      type="text"
                      name="name"
                      placeholder="Enter your Name"
                      required
                      onChange={handleChange}
                   />
                 </label>

                  <label className="reg-field">
                   <span className="reg-text">Surname</span>
                   <input
                      type="text"
                      name="surname"
                      placeholder="Enter your Surname"
                      required
                      onChange={handleChange}
                   />
                 </label>

                  <label className="reg-field">
                   <span className="reg-text">Date of Birth</span>
                   <input
                      type="date"
                      name="dob"
                      placeholder="Enter your Date of Birth"
                      required
                      onChange={handleChange}
                   />
                 </label>

                <label className="reg-field">
                  <span className="reg-text">Gender</span>
                  <div className="radio-group">
                    <label className="radio-option">
                      <input
                        type="radio"
                        name="gender"
                        value="Male"
                        onChange={handleChange}
                      />
                      Male
                    </label>
                    <label className="radio-option">
                      <input
                          type="radio"
                          name="gender"
                          value="Female"
                          onChange={handleChange} 
                      />
                      Female
                    </label>
                  </div>
                </label>

                <label className="reg-field">
                  <span className="reg-text">Address</span>
                  <textarea
                    name="address"
                    placeholder="Enter your Address"
                    required
                    onChange={handleChange}
                  />
                </label>

                <label className="reg-field">
                  <span className="reg-text">Medical History</span>
                  <textarea
                      name="medical_history"
                      placeholder="Enter your Medical History"
                      onChange={handleChange} 
                  />
                  
                  <div className="file-upload">
                    <input type="file" name="myfile" onChange={(e) => setAttachment(e.target.files[0])}/>
                    <label htmlFor="myfile" className="file-label">Upload Attachment</label>
                    <span className="file-name">No file chosen</span>
                  </div>
                </label>

                 <label className="reg-field">
                   <span className="reg-text">Email</span>
                   <input
                      type="email"
                      name="email"
                      placeholder="Enter your email"
                      required
                      onChange={handleChange} 
                   />
                 </label>
       
                 <label className="field">
                   <span className="reg-text">Password</span>
                   <input
                      type="password"
                      name="password"
                      placeholder="Enter your password"
                      required
                      onChange={handleChange} 
                   />
                 </label>
       
                 <button type="submit" className="reg-button">Register</button>
               </form>
             </div>
        </div>
    )
}