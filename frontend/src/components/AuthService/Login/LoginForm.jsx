import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../../services/axios'; 
import Logo from '/logo-ldf.png';
import './LoginForm.css';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Remove CSRF step - just login directly with token auth
      const response = await axiosInstance.post('/api/login', {
        email,
        password,
      });

      const { token, dashboard, user } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Token will be added automatically by interceptor
      navigate(dashboard);

    } catch (err) {
      console.error('Login error:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
};

  return (
    <div className="auth-wrap">
      <div className="logo-container">
        <img src={Logo} alt="LDF logo" />
      </div>
      <div className="auth-card">
        <div className="auth-header">
          <p className="auth-sub">Sign in to Clinic Tracking App</p>
        </div>

        <form className="auth-form" onSubmit={handleLogin} noValidate>
          <label className="field">
            <span className="label-text">Email</span>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>

          <label className="field">
            <span className="label-text">Password</span>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
          
          <div className='forgot-password'>
            <a href='/forgot-password'> Forgot Password? </a>
          </div>
        </form>
      </div>
    </div>
  );
}