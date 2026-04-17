import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

const Navbar = () => {
  const navigate = useNavigate();
  const isAuthenticated = authService.isAuthenticated();
  const user = authService.getCurrentUser();

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        Expenses Tracker
      </Link>
      
      {isAuthenticated ? (
        <ul className="navbar-nav">
          <li>
            <Link to="/dashboard">Dashboard</Link>
          </li>
          <li>
            <Link to="/history">History</Link>
          </li>
          <li>
            <span style={{ color: '#ccc', marginRight: '10px' }}>
              Hello, {user?.name}
            </span>
          </li>
          <li>
            <button
              onClick={handleLogout}
              className="btn btn-danger"
              style={{ padding: '5px 15px', fontSize: '14px' }}
            >
              Logout
            </button>
          </li>
        </ul>
      ) : (
        <ul className="navbar-nav">
          <li>
            <Link to="/login">Login</Link>
          </li>
          <li>
            <Link to="/register">Register</Link>
          </li>
        </ul>
      )}
    </nav>
  );
};

export default Navbar;
