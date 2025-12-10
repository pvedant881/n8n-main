import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import './Navbar.css';

export const Navbar = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          Auth App
        </Link>
        <div className="navbar-menu">
          {user ? (
            <>
              <span className="navbar-user">Welcome, {user.email}</span>
              <button onClick={handleLogout} className="navbar-logout-btn">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="navbar-link">
                Login
              </Link>
              <Link to="/register" className="navbar-link">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};
