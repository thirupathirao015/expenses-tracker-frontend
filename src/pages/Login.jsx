import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

const ForgotPasswordModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
    }}>
      <div style={{
        background: 'white',
        padding: '30px',
        borderRadius: '8px',
        width: '90%',
        maxWidth: '400px',
        textAlign: 'center',
      }}>
        <h3 style={{ marginBottom: '15px', color: '#1976d2' }}>🔐 Forgot Password?</h3>
        <p style={{ marginBottom: '20px', color: '#666', lineHeight: '1.5' }}>
          Please reach out to <strong>Thirupathi</strong> to reset your password.
        </p>
        <p style={{ 
          backgroundColor: '#e3f2fd', 
          padding: '12px', 
          borderRadius: '4px',
          marginBottom: '20px',
          fontSize: '14px',
          color: '#333'
        }}>
          📞 Contact admin for password reset assistance
        </p>
        <button
          className="btn btn-primary"
          style={{ width: '100%' }}
          onClick={onClose}
        >
          Got it
        </button>
      </div>
    </div>
  );
};

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await authService.login(formData);
      // Check if user must change password
      if (result.mustChangePassword) {
        navigate('/change-password');
        return;
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: '400px', margin: '50px auto' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Login</h2>
        
        {error && <div className="alert alert-error">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-control"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                className="form-control"
                value={formData.password}
                onChange={handleChange}
                required
                style={{ paddingRight: '40px' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '12px',
                  padding: '0',
                  width: '40px',
                  height: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                tabIndex={-1}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>
          
          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%' }}
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        
        <p style={{ textAlign: 'center', marginTop: '15px' }}>
          <button
            type="button"
            onClick={() => setShowForgotModal(true)}
            style={{
              background: 'none',
              border: 'none',
              color: '#1976d2',
              cursor: 'pointer',
              fontSize: '14px',
              textDecoration: 'underline'
            }}
          >
            Forgot Password?
          </button>
        </p>
        
        <p style={{ textAlign: 'center', marginTop: '10px' }}>
          Don't have an account? <Link to="/register">Register</Link>
        </p>
        
        <ForgotPasswordModal 
          isOpen={showForgotModal} 
          onClose={() => setShowForgotModal(false)} 
        />
      </div>
    </div>
  );
};

export default Login;
