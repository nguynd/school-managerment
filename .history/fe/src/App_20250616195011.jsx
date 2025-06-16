import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Header from './components/Header.jsx';
import Sidebar from './components/Sidebar.jsx';
import TeacherDashboard from './components/TeacherDashboard.jsx';
import StudentDashboard from './components/StudentDashboard.jsx'; // điều chỉnh path nếu cần
import Login from './components/Login.jsx';
import './App.css';

// ✅ Đường dẫn đúng: ./components/admin/
import AdminDashboard from './components/admin/AdminDashboard.jsx';
import UsersTable from './components/admin/UsersTable.jsx';
import SubjectsTable from './components/admin/SubjectsTable.jsx';
import ManageClassesAndStudents from './components/admin/ManageClassesAndStudents';

function App() {
  const [user, setUser] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem("user"));
    setUser(savedUser);
  }, [location]);

  const isLoggedIn = !!user;
  const isAdmin = user?.role === "admin";
  const isTeacher = user?.role === "teacher";

  return (
    <div>
      {isLoggedIn && <Header />}
      {isLoggedIn && <Sidebar />}
      <Routes>
        {/* ✅ Nếu đã đăng nhập thì không cho truy cập /login nữa */}
        <Route
          path="/login"
          element={
            isLoggedIn
              ? <Navigate to={isAdmin ? "/admin/dashboard" : "/dashboard?tab=homeroom"} replace />
              : <Login />
          }
        />

        {/* Điều hướng gốc tùy vai trò */}
        <Route
          path="/"
          element={
            isLoggedIn
              ? <Navigate to={isAdmin ? "/admin/dashboard" : "/dashboard?tab=homeroom"} replace />
              : <Navigate to="/login" replace />
          }
        />

        {/* Dashboard chỉ cho giáo viên */}
        <Route
          path="/dashboard"
          element={
            isLoggedIn && isTeacher
              ? <TeacherDashboard />
              : <Navigate to={isAdmin ? "/admin/dashboard" : "/login"} replace />
          }
        />

        {/* Các route dành riêng cho admin */}
        <Route
          path="/admin/dashboard"
          element={
            isLoggedIn && isAdmin
              ? <AdminDashboard />
              : <Navigate to="/dashboard" replace />
          }
        />
        <Route
          path="/admin/classes"
          element={
            isLoggedIn && isAdmin
              ? <ManageClassesAndStudents />
              : <Navigate to="/dashboard" replace />
          }
        />
        <Route
          path="/admin/users"
          element={
            isLoggedIn && isAdmin
              ? <UsersTable />
              : <Navigate to="/dashboard" replace />
          }
        />
        <Route
          path="/admin/subjects"
          element={
            isLoggedIn && isAdmin
              ? <SubjectsTable />
              : <Navigate to="/dashboard" replace />
          }
        />
      </Routes>
    </div>
  );
}

export default App;
