import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import ManageClassesAndStudents from './ManageClassesAndStudents';
import AdminAPI from "../../services/AdminAPI";

function AdminDashboard() {
  const [studentCount, setStudentCount] = useState(0);
  const [teacherCount, setTeacherCount] = useState(0);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const students = await AdminAPI.getAllStudents();
        const teachers = await AdminAPI.getAllTeachers();
        setStudentCount(students.length);
        setTeacherCount(teachers.length);
      } catch (err) {
        console.error("Lỗi khi lấy thống kê:", err);
      }
    };

    fetchCounts();
  }, []);

  const handleInitSemester = async () => {
    const { value: formValues } = await Swal.fire({
      title: "Khởi tạo kỳ học mới",
      html:
        `<label class="block text-left mb-1">Kỳ học:</label>` +
        `<select id="semester" class="swal2-input">
          <option value="HK1">HK1</option>
          <option value="HK2">HK2</option>
        </select>` +
        `<label class="block text-left mt-2 mb-1">Năm học:</label>` +
        `<input type="number" id="year" class="swal2-input" value="${new Date().getFullYear()}">`,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Xác nhận",
      cancelButtonText: "Hủy",
      preConfirm: () => {
        const semester = document.getElementById("semester").value;
        const year = document.getElementById("year").value;
        if (!semester || !year) {
          Swal.showValidationMessage("Vui lòng chọn đầy đủ kỳ học và năm học");
        }
        return { semester, year };
      },
    });

    if (formValues) {
      try {
        await AdminAPI.initSemester(formValues);
        Swal.fire("Thành công", "Đã khởi tạo điểm cho kỳ học mới", "success");
      } catch (err) {
        console.error("Lỗi khởi tạo kỳ học:", err);
        Swal.fire("Lỗi", "Không thể khởi tạo kỳ học", "error");
      }
    }
  };

  return (
    <div className="p-6 space-y-6 mt-10">
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="mt-2 text-gray-600">Tổng quan hệ thống quản lý điểm</p>
      </div>

      {/* 👉 Thống kê + nút khởi tạo nằm cùng hàng */}
      <div className="ml-68 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 items-stretch">
        <div className="bg-white shadow rounded-lg p-4">
          <h2 className="text-lg font-semibold text-gray-700">Tổng số học sinh</h2>
          <p className="mt-2 text-2xl font-bold text-blue-600">{studentCount}</p>
        </div>

        <div className="bg-white shadow rounded-lg p-4">
          <h2 className="text-lg font-semibold text-gray-700">Tổng số giáo viên</h2>
          <p className="mt-2 text-2xl font-bold text-green-600">{teacherCount}</p>
        </div>

        <div className="bg-white shadow rounded-lg p-4 flex items-center justify-center">
          <button
            onClick={handleInitSemester}
            className="w-full h-full bg-blue-600 text-white text-base font-semibold rounded hover:bg-blue-700"
          >
            Khởi tạo kỳ học
          </button>
        </div>
      </div>

      {/* Quản lý lớp & học sinh */}
      <ManageClassesAndStudents />
    </div>
  );
}

export default AdminDashboard;
