import { useAuthStore } from '../store/authStore';
import './Dashboard.css';

export const Dashboard = () => {
  const { user } = useAuthStore();

  return (
    <div className="dashboard-container">
      <div className="welcome-section">
        <h1>Welcome to the Dashboard</h1>
        <p>
          You are logged in as: <strong>{user?.email}</strong>
        </p>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h2>User Profile</h2>
          <p>View and manage your profile information</p>
          <button className="card-btn">View Profile</button>
        </div>

        <div className="dashboard-card">
          <h2>Settings</h2>
          <p>Manage your account settings and preferences</p>
          <button className="card-btn">Open Settings</button>
        </div>

        <div className="dashboard-card">
          <h2>Activity</h2>
          <p>View your recent activity and history</p>
          <button className="card-btn">View Activity</button>
        </div>

        <div className="dashboard-card">
          <h2>Security</h2>
          <p>Manage your security and authentication settings</p>
          <button className="card-btn">Manage Security</button>
        </div>
      </div>
    </div>
  );
};
