import { useState } from 'react'
import Logo from '/logo-ldf.png';
import axiosInstance from '../../../../services/axios';
import './StaffRegistration.css';

export default function StaffRegistrationForm () {
    const [form, setForm] = useState({
      name: "",
      surname: "",
      rank: "",
      specialization: "",
      department: "",
      phone: "",
      email: "",
      password: "",
    });

 const handleChange = (e) => {
      setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        Object.entries(form).forEach(([key, value]) => {
            formData.append(key, value);
        });
 
        try {
            const response = await axiosInstance.post("/api/register-staff", formData, {
            headers: { "Content-Type": "multipart/form-data" },
            });

            alert("Staff registered successfully!");
            console.log("Response:", response.data);
            window.location.href = "/login";
        } catch (error) {
            console.error("Registration failed:", error.response?.data || error.message);
            alert("Error: " + (error.response?.data?.message || "Registration failed"));
        }
    };


    return (
        <div className="staff-wrap">
            <div className="logo-container">
            <img src={Logo} alt="LDF logo" />
            </div>
            <div className="staff-card">
            <div className="staff-header">
                <p className="staff-sub"> Create a new Staff Account</p>
            </div>
    
            <form className="staff-form" onSubmit={handleSubmit} noValidate>

                <label className="staff-field">
                <span className="staff-text">Name</span>
                <input
                    type="text"
                    name="name"
                    placeholder="Enter your Name"
                    required
                    onChange={handleChange}
                />
                </label>

                <label className="staff-field">
                <span className="staff-text">Surname</span>
                <input
                    type="text"
                    name="surname"
                    placeholder="Enter your Surname"
                    required
                    onChange={handleChange}
        
                />
                </label>

                <label className="staff-field">
                    <span className="staff-text"> Rank </span>
                    <select name="rank" required onChange={handleChange}>
                        <option value="" >Select your Rank</option>
                        <option value="Private">Private</option>
                        <option value="Lance Corporal">Lance Corporal</option>
                        <option value="Sergeant">Sergeant</option>
                        <option value="Major">Major</option>
                        <option value="Captain">Captain</option>
                        <option value="Lieutenant">Lieutenant</option>
                        <option value="Colonel"> Colonel </option>        
                    </select>
                </label>

                <label className="staff-field">
                    <span className="staff-text"> Specialization </span>
                    <select name="specialization" required onChange={handleChange}>
                        <option value="" >Select your Specialization</option>
                        <option value="Surgeon">Surgeon</option>
                        <option value="Cardiology">Cardiology</option>
                        <option value="Dentist">Dentist</option>
                        <option value="General Medicine">General Medicine</option>
                        <option value="Orthopedic">Orthopedic</option>
                        <option value="Optician">Optician</option>
                        <option value="Gynaecology"> Gynaecology </option>  
                        <option value="Pharmacist"> Pharmacist </option>  
                        <option value="Ambulance Driver"> Ambulance Driver </option>        
                    </select>
                </label>

                <label className="staff-field">
                    <span className="staff-text"> Department </span>
                    <select name="department" required onChange={handleChange}>
                        <option value="" >Select your Department</option>
                        <option value="General Medicine">General Medicine</option>
                        <option value="Pharmacy">Pharmacy</option>
                        <option value="Emergency Services"> Emergency Services</option>
                    </select>
                </label>
                    

                <label className="staff-field">
                    <span className="staff-text">Phone Number</span>
                    <input
                        type="tel"
                        name="phone"
                        placeholder="Enter your Phone Number"
                        required
                        onChange={handleChange}
                    />
                </label>

                <label className="staff-field">
                <span className="staff-text">Email</span>
                <input
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    required
                    onChange={handleChange}
                />
                </label>
    
                <label className="staff-field">
                <span className="staff-text">Password</span>
                <input
                    type="password"
                    name="password"
                    placeholder="Enter your password"
                    required
                    onChange={handleChange}
                />
                </label>
    
                <button type="submit" className="staff-button">register</button>
            </form>
            </div>
        </div>
        
    )
}