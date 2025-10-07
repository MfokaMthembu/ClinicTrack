import { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import Logo from '/logo-ldf.png'
import HealthUnit from '../src/assets/images/health-unit.jpg';
import PatientCare from '../src/assets/images/ldf-mmh-nurse.jpg';
import DoctorConsult from '../src/assets/images/health3.jpg';
import GeneralConsultation from './assets/images/icons8-hospital-100.png';
import EmergencyServices from './assets/images/emergency-sevices.jpg';
import PediatricServices from './assets/images/icons8-children-100.png';
import Radiology from './assets/images/radiology.jpg';
import Pharmacy from './assets/images/icons8-pharmacy-100.png';
import Maternity from './assets/images/icons8-maternity-100.png';
import './App.css'

function App() {
  const navigate = useNavigate();
  // About Us slideshow index state
  const [aboutIndex, setAboutIndex] = useState(0);

  // Slideshow state and handlers
  const images = [HealthUnit, PatientCare, DoctorConsult];
  const aboutPrev = () => {
    setAboutIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };
  const aboutNext = () => {
    setAboutIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="app">
      {/* Navigation Bar */}
      <header className="navbar">
        <nav className="navbar-container">
          <div className="navbar-left">
            <img src={Logo} alt="LDF Logo" className="logo" />
            <h1 className="site-title">Makoanyane Military Hospital</h1>
          </div>

          <div className="navbar-links">
            <a href="#">Home</a>
            <a href="#">About Us</a>
            <a href="#">Services</a>
            <a href="#">Contact Us</a>
          </div>

          <div className="navbar-buttons">
            <button className="btn btn-outline" onClick={() => navigate("/login")}>Login</button>
            <button className="btn btn-primary"  onClick={() => navigate("/register")}>Sign Up</button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className='hero-cont'>
          <h2>Clinic Tracking App</h2>
          <div>
            <p>Your trusted partner in military healthcare</p>
            <p>Patient care made simple with efficiency and compassion</p>
            <p>Dedicated to serving those who serve the nation</p>
          </div>
        </div>

        {/* Hero Cards for Values, Mission & Vision */}
        <div className='hero-cards'>
          <div className='cards-wrapper'>
            <div className='h-card'>
              <h3> Our Values </h3>
              <p>Compassion, Excellence, Integrity, Respect, Teamwork. </p>
            </div>  

            <div className='h-card'>
              <h3> Our Mission </h3>
              <p> 
                To provide efficient, affordable, high quality medical care,
                in a compassionate and rehabilitative health care services to its clientele.
              </p>
            </div>

            <div className='h-card'>
              <h3> Our Vision </h3>
              <p> 
                To be a leading military hospital recognized for exceptional patient care, innovation, and community engagement. 
              </p>
            </div>
          </div>   
        </div>  
      </section>
        
      {/* About Us */}
      <section className="about">
        <h3>About Us</h3>
        <p>Makoanyane Military Hospital (MMH) was established in 1988 with the purpose of serving the Army personnel and their families. Before then there was an Army clinic which was established as early as in 1980.
          Its purpose was to minimize the influx of the uniformed personnel queuing at the Queen Elizabeth Ⅱ Hospital (QE Ⅱ) and other local clinics, such as Loretto and the Maseru City Council (MCC) clinic in Maseru urban. 
          This initiative worked phenomenally well with the existing clinics though it was small in terms of accommodating Military personnel and their families.
        </p> <br/>

        {/* About Us Image slides */}
          <div className="about-image">
            <div className="slides" style={{ transform: `translateX(-${aboutIndex * 100}%)` }}>
              {images.map((img, index) => (
                <div className="slide" key={index}>
                  <img src={img} alt={`About Us Image ${index + 1}`} />
                </div>
              ))}
            </div>

            {/* Arrows */}
            <button className="arrow left" onClick={aboutPrev}>
              &#10094;
            </button>
            <button className="arrow right" onClick={aboutNext}>
              &#10095;
            </button>
          </div>
      </section>

      {/* Services */}
      <section className="services">
        <h4>Services</h4>
        <div className="service-cards">
          <div className="card">
            <img src={GeneralConsultation} alt="General consultation" />
            <h5>General Consultation</h5>
            <p>Comprehensive medical consultations for all age groups.</p>
          </div>
          <div className="card">
            <img src={EmergencyServices} alt="Emergency Services" />
            <h5>Emergency Care</h5>
            <p>24/7 emergency services for urgent medical situations.</p>
          </div>
          <div className="card">
            <img src={PediatricServices} alt="Pediatric Services" />
            <h5>Pediatric Services</h5>
            <p>Specialized care for infants, children, and adolescents.</p>
          </div>
          <div className="card">
            <img src={Radiology} alt="X-ray scans" />
            <h5>Radiology Services</h5>
            <p> For all your x-ray scans </p>
          </div>
          <div className="card">
            <img src={Pharmacy} alt="Pharmacy" />
            <h5>Pharmacy</h5>
            <p>On-site pharmacy for convenient medication access.</p>
          </div>
          <div className="card">
            <img src={Maternity} alt="Maternity Care" />
            <h5> Maternity Services</h5>
            <p>Comprehensive prenatal, delivery, and postnatal care.</p>          
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>&copy; 2025 KaShaba Technologies. All rights reserved.</p>
      </footer>
    </div>
  )
}

export default App
