import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Header from './components/Header.jsx';
import Sidebar from './components/Sidebar.jsx';
import Dashboard from './components/Dashboard.jsx';
import Login from './components/Login.jsx';
import './App.css';

// ✅ Admin pages
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import ClassesTable from './pages/admin/ClassesTable.jsx';
import StudentsTable from './pages/admin/StudentsTable.jsx';
import UsersTable from './pages/admin/UsersTable.jsx';
import SubjectsTable from './pages/admin/SubjectsTable.jsx';

function App() {
  const [user, setUser] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem("user"));
    setUser(savedUser);
  }, [location]);

  const isLoggedIn = !!user;
  const isAdmin = user?.role === "admin";

  return (
    <div>
      {isLoggedIn && <Header />}
      {isLoggedIn && <Sidebar />}
      <Routes>
        {/* Đăng nhập */}
        <Route path="/login" element={<Login />} />

        {/* Chuyển hướng từ "/" */}
        <Route
          path="/"
          element={
            isLoggedIn
              ? <Navigate to={isAdmin ? "/admin" : "/dashboard?tab=homeroom"} replace />
              : <Navigate to="/login" replace />
          }
        />

        {/* Giáo viên dashboard */}
        <Route
          path="/dashboard"
          element={
            isLoggedIn
              ? <Dashboard />
              : <Navigate to="/login" replace />
          }
        />

        {/* Admin routes */}
        <Route
          path="/admin"
          element={
            isAdmin
              ? <AdminDashboard />
              : <Navigate to="/dashboard" replace />
          }
        />
        <Route
          path="/admin/classes"
          element={
            isAdmin
              ? <ClassesTable />
              : <Navigate to="/dashboard" replace />
          }
        />
        <Route
          path="/admin/students"
          element={
            isAdmin
              ? <StudentsTable />
              : <Navigate to="/dashboard" replace />
          }
        />
        <Route
          path="/admin/users"
          element={
            isAdmin
              ? <UsersTable />
              : <Navigate to="/dashboard" replace />
          }
        />
        <Route
          path="/admin/subjects"
          element={
            isAdmin
              ? <SubjectsTable />
              : <Navigate to="/dashboard" replace />
          }
        />
      </Routes>
    </div>
  );
}

export default App;
