import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import Header from "./components/Header.jsx";
import Sidebar from "./components/Sidebar.jsx";
import TeacherDashboard from "./components/TeacherDashboard.jsx";
import StudentDashboard from "./components/StudentDashboard.jsx"; // ✅ dashboard HS
import Login from "./components/Login.jsx";
import "./App.css";

// ✅ Đường dẫn đúng: ./components/admin/
import AdminDashboard from "./components/admin/AdminDashboard.jsx";
import UsersTable from "./components/admin/UsersTable.jsx";
import SubjectsTable from "./components/admin/SubjectsTable.jsx";
import ManageClassesAndStudents from "./components/admin/ManageClassesAndStudents.jsx";

function App() {
  const [user, setUser] = useState(null);
  const location = useLocation();

  /* ----------------------- Lấy thông tin user ----------------------- */
  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem("user"));
    setUser(savedUser);
  }, [location]);

  /* ----------------------- Phân quyền ----------------------- */
  const isLoggedIn = !!user;
  const isAdmin = user?.role === "admin";
  const isTeacher = user?.role === "teacher";
  const isStudent = user?.role === "student";

  /* ----------------------- JSX ----------------------- */
  return (
    <div>
      {isLoggedIn && <Header />}
      {isLoggedIn && <Sidebar />}

      <Routes>
        {/* ---------- /login ---------- */}
        <Route
          path="/login"
          element={
            isLoggedIn ? (
              isAdmin ? (
                <Navigate to="/admin/dashboard" replace />
              ) : isTeacher ? (
                <Navigate to="/dashboard?tab=homeroom" replace />
              ) : (
                <Navigate to="/student/dashboard" replace />
              )
            ) : (
              <Login />
            )
          }
        />

        {/* ---------- / (root) ---------- */}
        <Route
          path="/"
          element={
            isLoggedIn ? (
              isAdmin ? (
                <Navigate to="/admin/dashboard" replace />
              ) : isTeacher ? (
                <Navigate to="/dashboard?tab=homeroom" replace />
              ) : (
                <Navigate to="/student/dashboard" replace />
              )
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* ---------- Dashboard giáo viên ---------- */}
        <Route
          path="/dashboard"
          element={
            isLoggedIn && isTeacher ? (
              <TeacherDashboard />
            ) : (
              <Navigate to={isAdmin ? "/admin/dashboard" : "/login"} replace />
            )
          }
        />

        {/* ---------- Dashboard học sinh ---------- */}
        <Route
          path="/student/dashboard"
          element={
            isLoggedIn && isStudent ? (
              <StudentDashboard />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* ---------- Các route dành riêng cho admin ---------- */}
        <Route
          path="/admin/dashboard"
          element={
            isLoggedIn && isAdmin ? (
              <AdminDashboard />
            ) : (
              <Navigate to={isTeacher ? "/dashboard" : "/login"} replace />
            )
          }
        />
        <Route
          path="/admin/classes"
          element={
            isLoggedIn && isAdmin ? (
              <ManageClassesAndStudents />
            ) : (
              <Navigate to={isTeacher ? "/dashboard" : "/login"} replace />
            )
          }
        />
        <Route
          path="/admin/users"
          element={
            isLoggedIn && isAdmin ? (
              <UsersTable />
            ) : (
              <Navigate to={isTeacher ? "/dashboard" : "/login"} replace />
            )
          }
        />
        <Route
          path="/admin/subjects"
          element={
            isLoggedIn && isAdmin ? (
              <SubjectsTable />
            ) : (
              <Navigate to={isTeacher ? "/dashboard" : "/login"} replace />
            )
          }
        />
      </Routes>
    </div>
  );
}

export default App;
