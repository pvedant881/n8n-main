import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import './Home.css';

export const Home = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  if (user) {
    navigate('/dashboard');
    return null;
  }

  return (
    <div className="home-container">
      <div className="home-content">
        <h1>Welcome to Auth App</h1>
        <p>A modern authentication system with JWT tokens and persistent sessions</p>
        <div className="home-buttons">
          <button onClick={() => navigate('/login')} className="home-btn primary-btn">
            Login
          </button>
          <button onClick={() => navigate('/register')} className="home-btn secondary-btn">
            Register
          </button>
        </div>
      </div>
    </div>
  );
};
