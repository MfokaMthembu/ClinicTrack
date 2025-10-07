import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import './UpdateForm.css';
import Logo from '/logo-ldf.png';

export default function UpdateForm () {
    const navigate = useNavigate();

    return (
        <div className="update-container">
            <div className="update-card">
                <div className="logo-container">
                <img src={Logo} alt="LDF logo" className="ldf-logo" />
                </div>

                <h2 className="update-title"> Update Account </h2>
                <p className="update-subtitle">
                Check and Update User Auth info Accordingly
                </p>
                <button className="close-btn" onClick={() => navigate(0)}>
                    &times;
                </button>
                <form className="update-form"  noValidate>
                    <label className="update-field">  
                        <span>Name</span>
                        <input type="text" name="name" required/>
                    </label>
                    

                    <label className="update-field">  
                        <span> Surname </span>  
                        <input type="text" name="surname" required/> 
                    </label>
                     

                    <label className="update-field"> 
                        <span> Email </span> 
                        <input type="email" name="email" required/>
                    </label>
                     
                    <label className="update-field"> 
                        <span> Status </span> 
                        <select>
                            <option value=""> select user status </option>
                            <option value="active"> Doctor </option>
                            <option value="suspended"> Patient </option>
                            <option value="pending"> Pharmacist </option>
                        </select>
                    </label>

                    <label className="update-field">  
                        <span> Role </span>
                        <select>
                            <option value=""> select user role </option>
                            <option value="doctor"> Doctor </option>
                            <option value="patient"> Patient </option>
                            <option value="pharmacist"> Pharmacist </option>
                            <option value="ambulance-driver"> Ambulance driver </option>
                        </select>
                    </label>
                    

                    <button type="submit" className="update-btn">
                        Update
                    </button>
                </form>
            </div>
        </div>

    )
}