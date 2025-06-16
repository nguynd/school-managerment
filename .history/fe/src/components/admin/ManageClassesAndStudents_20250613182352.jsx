import { useEffect, useState } from "react";
import AdminAPI from "../../services/AdminAPI";

function ManageClassesAndStudents() {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [students, setStudents] = useState([]);

  // ─── API CALLS ───────────────────────────────────────────────
  const fetchClasses = async () => {
    const res = await AdminAPI.getAllClasses();
    setClasses(res || []);
  };

  const fetchStudents = async (classId) => {
    const res = await AdminAPI.getStudentsByClass(classId);
    setStudents(res || []);
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  // ─── CRUD LỚP ────────────────────────────────────────────────
  const handleAddClass = async () => {
    const name = prompt("Nhập tên lớp:");
    if (name) {
      await AdminAPI.createClass({ name });
      fetchClasses();
    }
  };

  const handleEditClass = async (cls) => {
    const name = prompt("Sửa tên lớp:", cls.name);
    if (name) {
      await AdminAPI.updateClass(cls.id, { name });
      fetchClasses();
    }
  };

  const handleDeleteClass = async (id) => {
    if (confirm("Bạn có chắc chắn muốn xoá lớp này?")) {
      await AdminAPI.deleteClass(id);
      fetchClasses();
    }
  };

  // ─── CRUD HỌC SINH ───────────────────────────────────────────
  const handleAddStudent = async () => {
    const name = prompt("Nhập tên học sinh:");
    if (name) {
      await AdminAPI.createStudent({ name, class_id: selectedClass.id });
      fetchStudents(selectedClass.id);
    }
  };

  const handleEditStudent = async (sv) => {
    const name = prompt("Sửa tên học sinh:", sv.name);
    if (name) {
      await AdminAPI.updateStudent(sv.id, { name });
      fetchStudents(selectedClass.id);
    }
  };

  const handleDeleteStudent = async (id) => {
    if (confirm("Xoá học sinh này?")) {
      await AdminAPI.deleteStudent(id);
      fetchStudents(selectedClass.id);
    }
  };

  // ─── GIAO DIỆN HỌC SINH CỦA 1 LỚP ────────────────────────────
  if (selectedClass) {
    return (
      <div className="ml-64 p-4 mt-20">
        <button
          onClick={() => setSelectedClass(null)}
          className="mb-4 px-3 py-1 border rounded text-sm"
        >
          ← Quay lại danh sách lớp
        </button>

        {/* Tiêu đề + nút thêm học sinh */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">
            Học sinh lớp {selectedClass.name}
          </h2>
          <button
            onClick={handleAddStudent}
            className="px-4 py-2 bg-green-600 text-white rounded"
          >
            ➕ Thêm học sinh
          </button>
        </div>

        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">#</th>
              <th className="p-2 border">Họ tên</th>
              <th className="p-2 border">Ngày sinh</th>
              <th className="p-2 border">Giới tính</th>
              <th className="p-2 border w-32">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {students.map((sv, i) => (
              <tr key={sv.id}>
                <td className="p-2 border">{i + 1}</td>
                <td className="p-2 border">{sv.name}</td>
                <td className="p-2 border">
                  {new Date(sv.date_of_birth).toLocaleDateString("vi-VN")}
                </td>
                <td className="p-2 border">{sv.gender}</td>
                <td className="p-2 border text-center space-x-2">
                  <button onClick={() => handleEditStudent(sv)}>✏️</button>
                  <button onClick={() => handleDeleteStudent(sv.id)}>🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // ─── GIAO DIỆN DANH SÁCH LỚP ─────────────────────────────────
  return (
    <div className="ml-64 p-4 mt-20">
      {/* Tiêu đề + nút thêm lớp */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Danh sách lớp</h2>
        <button
          onClick={handleAddClass}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          ➕ Thêm lớp
        </button>
      </div>

      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">#</th>
            <th className="p-2 border">Tên lớp</th>
            <th className="p-2 border">GVCN</th>
            <th className="p-2 border">Sĩ số</th>
            <th className="p-2 border w-32">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {classes.map((cl, i) => (
            <tr
              key={cl.id}
              onClick={() => {
                setSelectedClass(cl);
                fetchStudents(cl.id);
              }}
              className="hover:bg-gray-50 cursor-pointer"
            >
              <td className="p-2 border">{i + 1}</td>
              <td className="p-2 border">{cl.name}</td>
              <td className="p-2 border">{cl.teacher_name}</td>
              <td className="p-2 border">{cl.student_count}</td>
              <td
                className="p-2 border text-center space-x-2"
                onClick={(e) => e.stopPropagation()}
              >
                <button onClick={() => handleEditClass(cl)}>✏️</button>
                <button onClick={() => handleDeleteClass(cl.id)}>🗑️</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ManageClassesAndStudents;
