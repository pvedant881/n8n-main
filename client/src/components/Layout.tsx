import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { useAuthStore } from '../store/authStore';
import './Layout.css';

export const Layout = () => {
  const { user } = useAuthStore();

  return (
    <div className="layout">
      <Navbar />
      <div className="layout-body">
        {user && <Sidebar />}
        <main className="layout-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
