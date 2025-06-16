
import { useEffect, useState } from "react";
import AdminAPI from "../../services/AdminAPI";

function ManageClassesAndStudents() {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [students, setStudents] = useState([]);

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

  if (selectedClass) {
    return (
      <div className="ml-64 p-4 mt-10">
        <button onClick={() => setSelectedClass(null)} className="mb-4 px-3 py-1 border rounded text-sm">
          ← Quay lại danh sách lớp
        </button>

        <h2 className="text-xl font-semibold mb-4">Học sinh lớp {selectedClass.name}</h2>

        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">#</th>
              <th className="p-2 border">Họ tên</th>
              <th className="p-2 border">Ngày sinh</th>
              <th className="p-2 border">Giới tính</th>
            </tr>
          </thead>
          <tbody>
            {students.map((sv, i) => (
              <tr key={sv.id}>
                <td className="p-2 border">{i + 1}</td>
                <td className="p-2 border">{sv.name}</td>
                <td className="p-2 border">{new Date(sv.date_of_birth).toLocaleDateString("vi-VN")}</td>
                <td className="p-2 border">{sv.gender}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="ml-64 p-4 mt-6">
      <h2 className="text-xl font-semibold mb-4">Danh sách lớp</h2>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">#</th>
            <th className="p-2 border">Tên lớp</th>
            <th className="p-2 border">GVCN</th>
            <th className="p-2 border">Sĩ số</th>
          </tr>
        </thead>
        <tbody>
          {classes.map((cl, i) => (
            <tr key={cl.id}>
              <td className="p-2 border">{i + 1}</td>
              <td className="p-2 border text-blue-600 cursor-pointer" onClick={() => { setSelectedClass(cl); fetchStudents(cl.id); }}>
                {cl.name}
              </td>
              <td className="p-2 border">{cl.teacher_name}</td>
              <td className="p-2 border">{cl.student_count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ManageClassesAndStudents;
