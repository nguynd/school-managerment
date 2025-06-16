import { useEffect, useState } from "react";
import ManageClassesAndStudents from './ManageClassesAndStudents';
import AdminAPI from "../../services/AdminAPI";

function AdminDashboard() {
  const [studentCount, setStudentCount] = useState(0);
  const [teacherCount, setTeacherCount] = useState(0);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const students = await AdminAPI.getAllStudents();
        const users = await AdminAPI.getAllUsers();

        setStudentCount(students.length);
        setTeacherCount(users.filter((user) => user.role === "teacher").length);
      } catch (err) {
        console.error("Lỗi khi lấy dữ liệu thống kê:", err);
      }
    };

    fetchCounts();
  }, []);

  return (
    <div className="p-6 space-y-6 mt-10">
      <div>
      </div>

      <div className="ml-66 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-white shadow rounded-lg p-4">
          <h2 className="text-lg font-semibold text-gray-700">Tổng số học sinh</h2>
          <p className="mt-2 text-2xl font-bold text-blue-600">{studentCount}</p>
        </div>

        <div className="bg-white shadow rounded-lg p-4">
          <h2 className="text-lg font-semibold text-gray-700">Tổng số giáo viên</h2>
          <p className="mt-2 text-2xl font-bold text-green-600">{teacherCount}</p>
        </div>
      </div>

      {/* ✅ Giao diện quản lý lớp và học sinh */}
      <ManageClassesAndStudents />
    </div>
  );
}

export default AdminDashboard;
