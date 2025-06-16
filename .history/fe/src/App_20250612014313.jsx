import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Header from './components/Header.jsx';
import Sidebar from './components/Sidebar.jsx';
import Dashboard from './components/Dashboard.jsx';
import AdminDashboard from './components/AdminDashboard.jsx';
import Login from './components/Login.jsx';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem("user"));
    setUser(savedUser);
  }, [location]);

  const isLoggedIn = !!user;

  return (
    <div>
      {isLoggedIn && <Header />}
      {isLoggedIn && <Sidebar />}
      <Routes>
        {/* ✅ Route login */}
        <Route path="/login" element={<Login />} />

        {/* ✅ Route gốc chuyển hướng về Dashboard nếu đã login, nếu chưa thì về login */}
        <Route
          path="/"
          element={
            isLoggedIn
              ? <Navigate to="/dashboard?tab=homeroom" replace />
              : <Navigate to="/login" replace />
          }
        />

        {/* ✅ Dashboard chỉ cho người đăng nhập */}
        <Route
          path="/dashboard"
          element={
            isLoggedIn
              ? <Dashboard />
              : <Navigate to="/login" replace />
          }
        />

        {/* ✅ Admin chỉ cho admin */}
        <Route
          path="/admin"
          element={
            user?.role === "admin"
              ? <AdminDashboard />
              : <Navigate to="/dashboard" replace />
          }
        />
      </Routes>
    </div>
  );
}

export default App;
