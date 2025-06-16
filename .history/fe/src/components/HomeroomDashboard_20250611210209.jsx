import { useEffect, useState } from "react";
import HomeroomAPI from "../services/HomeroomAPI";

function HomeroomDashboard({ data }) {
  const [students, setStudents] = useState([]);
  const [classAverage, setClassAverage] = useState(null);
  const [semester, setSemester] = useState("HK1");
  const [year, setYear] = useState(2024);

  const [formData, setFormData] = useState({ name: "", date_of_birth: "", class_id: data?.class_id });
  const [editId, setEditId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchStudents = async () => {
    const res = await HomeroomAPI.getStudentsWithGrading(data.class_id, semester, year);
    setStudents(res);
  };

  useEffect(() => {
    if (!data?.class_id) return;
    fetchStudents();

    HomeroomAPI.getClassAverageScore(data.class_id, semester, year)
      .then(setClassAverage)
      .catch(err => console.error("❌ Lỗi trung bình lớp:", err));
  }, [data?.class_id, semester, year]);

  const openAddModal = () => {
    setEditId(null);
    setFormData({ name: "", date_of_birth: "", class_id: data.class_id });
    setIsModalOpen(true);
  };

  const openEditModal = (s) => {
    setFormData({
      name: s.name,
      date_of_birth: new Date(s.date_of_birth).toISOString().split("T")[0],
      class_id: data.class_id,
    });
    setEditId(s.id);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (confirm("Bạn có chắc chắn muốn xoá học sinh này?")) {
      await HomeroomAPI.deleteStudent(id);
      fetchStudents();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await HomeroomAPI.updateStudent(editId, formData);
      } else {
        await HomeroomAPI.createStudent(formData);
      }
      setIsModalOpen(false);
      fetchStudents();
    } catch (err) {
      console.error("❌ Lỗi xử lý học sinh:", err);
    }
  };

  if (!data) return <p>Không chủ nhiệm lớp nào.</p>;

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      {/* Bộ lọc */}
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

      {/* Nút thêm */}
      <div className="mt-6 mb-2">
        <button
          onClick={openAddModal}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          ➕ Thêm học sinh
        </button>
      </div>

      {/* Bảng danh sách học sinh */}
      <table className="w-full border text-sm">
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
              <td className="border p-2 text-center">{s.classification ?? "-"}</td>
              <td className="border p-2 text-center">
                <button onClick={() => openEditModal(s)} className="text-blue-600 hover:underline mr-2">Sửa</button>
                <button onClick={() => handleDelete(s.id)} className="text-red-600 hover:underline">Xoá</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal thêm/sửa học sinh */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">{editId ? "Sửa học sinh" : "Thêm học sinh"}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm">Họ tên:</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="border px-2 py-1 rounded w-full"
                  required
                />
              </div>
              <div>
                <label className="block text-sm">Ngày sinh:</label>
                <input
                  type="date"
                  value={formData.date_of_birth}
                  onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                  className="border px-2 py-1 rounded w-full"
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-gray-300 px-4 py-2 rounded"
                >
                  Huỷ
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                  {editId ? "Cập nhật" : "Thêm"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default HomeroomDashboard;
