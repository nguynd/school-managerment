import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Header from './components/Header.jsx';
import Sidebar from './components/Sidebar.jsx';
import Dashboard from './components/Dashboard.jsx';
import Login from './components/Login.jsx';
import './App.css';

// ✅ Đường dẫn đúng: ./components/admin/
import AdminDashboard from './components/admin/AdminDashboard.jsx';
import ClassesTable from './components/admin/ClassesTable.jsx';
import StudentsTable from './components/admin/StudentsTable.jsx';
import UsersTable from './components/admin/UsersTable.jsx';
import SubjectsTable from './components/admin/SubjectsTable.jsx';

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
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            isLoggedIn
              ? <Navigate to={isAdmin ? "/admin" : "/dashboard?tab=homeroom"} replace />
              : <Navigate to="/login" replace />
          }
        />
        <Route
          path="/dashboard"
          element={
            isLoggedIn
              ? <Dashboard />
              : <Navigate to="/login" replace />
          }
        />

        {/* ✅ Các route cho admin */}
        <Route path="/admin" element={isAdmin ? <AdminDashboard /> : <Navigate to="/dashboard" replace />} />
        <Route path="/admin/classes" element={isAdmin ? <ClassesTable /> : <Navigate to="/dashboard" replace />} />
        <Route path="/admin/students" element={isAdmin ? <StudentsTable /> : <Navigate to="/dashboard" replace />} />
        <Route path="/admin/users" element={isAdmin ? <UsersTable /> : <Navigate to="/dashboard" replace />} />
        <Route path="/admin/subjects" element={isAdmin ? <SubjectsTable /> : <Navigate to="/dashboard" replace />} />
      </Routes>
    </div>
  );
}

export default App;
