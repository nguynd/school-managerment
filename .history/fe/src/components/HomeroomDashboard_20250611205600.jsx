import { useEffect, useState } from "react";
import HomeroomAPI from "../services/HomeroomAPI";

function HomeroomDashboard({ data }) {
  const [students, setStudents] = useState([]);
  const [classAverage, setClassAverage] = useState(null);
  const [semester, setSemester] = useState("HK1");
  const [year, setYear] = useState(2024);

  const [formData, setFormData] = useState({ name: "", date_of_birth: "", class_id: data?.class_id });
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    if (!data?.class_id) return;

    const fetchData = async () => {
      try {
        const [studentsRes, avgRes] = await Promise.all([
          HomeroomAPI.getStudentsWithGrading(data.class_id, semester, year),
          HomeroomAPI.getClassAverageScore(data.class_id, semester, year),
        ]);
        setStudents(studentsRes);
        setClassAverage(avgRes);
      } catch (err) {
        console.error("❌ Lỗi khi lấy thông tin lớp chủ nhiệm", err);
      }
    };

    fetchData();
  }, [data?.class_id, semester, year]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await HomeroomAPI.updateStudent(editId, formData);
      } else {
        await HomeroomAPI.createStudent({ ...formData, class_id: data.class_id });
      }
      setFormData({ name: "", date_of_birth: "", class_id: data.class_id });
      setEditId(null);
      const refreshed = await HomeroomAPI.getStudentsWithGrading(data.class_id, semester, year);
      setStudents(refreshed);
    } catch (error) {
      console.error("❌ Lỗi khi gửi form học sinh:", error);
    }
  };

  const handleEdit = (s) => {
    setFormData({
      name: s.name,
      date_of_birth: s.date_of_birth.slice(0, 10),
      class_id: data.class_id,
    });
    setEditId(s.id);
  };

  const handleDelete = async (id) => {
    if (confirm("Bạn có chắc chắn muốn xoá học sinh này?")) {
      await HomeroomAPI.deleteStudent(id);
      const refreshed = await HomeroomAPI.getStudentsWithGrading(data.class_id, semester, year);
      setStudents(refreshed);
    }
  };

  if (!data) return <p>Không chủ nhiệm lớp nào.</p>;

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      {/* Bộ lọc học kỳ + năm học */}
      <div className="flex gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium">Học kỳ:</label>
          <select
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
            className="border px-2 py-1 rounded"
          >
            <option value="HK1">HK1</option>
            <option value="HK2">HK2</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium">Năm học:</label>
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
            className="border px-2 py-1 rounded w-24"
          />
        </div>
      </div>

      {/* Thông tin lớp */}
      <h2 className="text-xl font-bold mb-2">Lớp chủ nhiệm: {data.class_name}</h2>
      <p>Sĩ số: {students.length}</p>
      <p>Điểm TB lớp: {classAverage?.avg?.toFixed(2) ?? "..."}</p>
      <p>Xếp loại: {classAverage?.classification ?? "..."}</p>

      {/* Form thêm/sửa học sinh */}
      <form onSubmit={handleSubmit} className="mt-6 mb-4 flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-sm">Họ tên:</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="border px-2 py-1 rounded"
            required
          />
        </div>
        <div>
          <label className="block text-sm">Ngày sinh:</label>
          <input
            type="date"
            value={formData.date_of_birth}
            onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
            className="border px-2 py-1 rounded"
            required
          />
        </div>
        <button type="submit" className="bg-blue-500 text-white px-3 py-1 rounded">
          {editId ? "Cập nhật" : "Thêm"}
        </button>
        {editId && (
          <button
            type="button"
            className="bg-gray-300 text-black px-3 py-1 rounded"
            onClick={() => {
              setFormData({ name: "", date_of_birth: "", class_id: data.class_id });
              setEditId(null);
            }}
          >
            Huỷ
          </button>
        )}
      </form>

      {/* Danh sách học sinh */}
      <h3 className="mt-4 mb-2 text-lg font-semibold">Danh sách học sinh:</h3>
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">#</th>
            <th className="border p-2">Họ tên</th>
            <th className="border p-2">Ngày sinh</th>
            <th className="border p-2">ĐTB</th>
            <th className="border p-2">Xếp loại</th>
            <th className="border p-2">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {students.map((s, idx) => (
            <tr key={s.id}>
              <td className="border p-2 text-center">{idx + 1}</td>
              <td className="border p-2">{s.name}</td>
              <td className="border p-2">
                {new Date(s.date_of_birth).toLocaleDateString("vi-VN")}
              </td>
              <td className="border p-2 text-center">
                {s.average ? Number(s.average).toFixed(2) : "-"}
              </td>
              <td className="border p-2 text-center">
                {s.classification ?? "-"}
              </td>
              <td className="border p-2 text-center">
                <button
                  onClick={() => handleEdit(s)}
                  className="text-blue-600 hover:underline mr-2"
                >
                  Sửa
                </button>
                <button
                  onClick={() => handleDelete(s.id)}
                  className="text-red-600 hover:underline"
                >
                  Xoá
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default HomeroomDashboard;
