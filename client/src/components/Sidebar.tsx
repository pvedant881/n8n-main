import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import './Sidebar.css';

export const Sidebar = () => {
  const { user } = useAuthStore();

  if (!user) return null;

  return (
    <aside className="sidebar">
      <div className="sidebar-content">
        <h3>Menu</h3>
        <ul className="sidebar-menu">
          <li>
            <Link to="/dashboard">Dashboard</Link>
          </li>
          <li>
            <Link to="/profile">Profile</Link>
          </li>
        </ul>
      </div>
    </aside>
  );
};
