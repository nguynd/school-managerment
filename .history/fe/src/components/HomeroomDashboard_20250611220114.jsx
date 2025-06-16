import { useEffect, useState } from "react";
import { FiMoreVertical } from "react-icons/fi";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import HomeroomAPI from "../services/HomeroomAPI";

function HomeroomDashboard({ data }) {
  const [students, setStudents] = useState([]);
  const [classAverage, setClassAverage] = useState(null);
  const [semester, setSemester] = useState("HK1");
  const [year, setYear] = useState(2024);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isAdding, setIsAdding] = useState(false);

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

  const formatDateForInput = (dateString) => {
    const d = new Date(dateString);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const openAddModal = () => {
    setSelectedStudent({
      name: "",
      date_of_birth: "",
      class_id: data.class_id
    });
    setIsAdding(true);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedStudent(null);
    setIsAdding(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: selectedStudent.name,
        date_of_birth: selectedStudent.date_of_birth,
        class_id: data.class_id
      };

      if (isAdding) {
        await HomeroomAPI.createStudent(payload);
        toast.success("✅ Thêm học sinh thành công");
      } else {
        await HomeroomAPI.updateStudent(selectedStudent.id, payload);
        toast.success("✅ Cập nhật học sinh thành công");
      }

      fetchStudents();
      handleCloseModal();
    } catch (err) {
      toast.error("❌ Lỗi khi gửi dữ liệu");
    }
  };

  const handleDelete = async () => {
    if (confirm("Bạn có chắc chắn muốn xoá học sinh này?")) {
      try {
        await HomeroomAPI.deleteStudent(selectedStudent.id);
        toast.success("🗑️ Đã xoá học sinh");
        fetchStudents();
        handleCloseModal();
      } catch (err) {
        toast.error("❌ Lỗi khi xoá học sinh");
      }
    }
  };

  if (!data) return <p>Không chủ nhiệm lớp nào.</p>;

  return (
    <div className="p-4 bg-white rounded-lg shadow-md relative">
      <ToastContainer position="top-right" autoClose={2000} />

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
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
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
          {students.length === 0 ? (
            <tr>
              <td colSpan="6" className="text-center text-gray-500 p-4">Chưa có học sinh nào.</td>
            </tr>
          ) : students.map((s, idx) => (
            <tr key={s.id}>
              <td className="border p-2 text-center">{idx + 1}</td>
              <td className="border p-2">{s.name}</td>
              <td className="border p-2">{new Date(s.date_of_birth).toLocaleDateString("vi-VN")}</td>
              <td className="border p-2 text-center">{s.average ? Number(s.average).toFixed(2) : "-"}</td>
              <td className="border p-2 text-center">{s.classification ?? "-"}</td>
              <td className="border p-2 text-center">
                <button
                  onClick={() => {
                    setSelectedStudent({
                      ...s,
                      date_of_birth: formatDateForInput(s.date_of_birth)
                    });
                    setIsAdding(false);
                    setIsModalOpen(true);
                  }}
                  className="text-xl px-2 py-1 hover:bg-gray-100 rounded-full"
                  title="Sửa học sinh"
                >
                  <FiMoreVertical />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal thêm/sửa */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">
              {isAdding ? "Thêm học sinh" : "Sửa học sinh"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm">Họ tên:</label>
                <input
                  type="text"
                  value={selectedStudent.name}
                  onChange={(e) =>
                    setSelectedStudent({ ...selectedStudent, name: e.target.value })
                  }
                  className="border px-2 py-1 rounded w-full"
                  required
                />
              </div>
              <div>
                <label className="block text-sm">Ngày sinh:</label>
                <input
                  type="date"
                  value={selectedStudent.date_of_birth}
                  onChange={(e) =>
                    setSelectedStudent({ ...selectedStudent, date_of_birth: e.target.value })
                  }
                  className="border px-2 py-1 rounded w-full"
                  required
                />
              </div>

              <div className="flex justify-between items-center pt-2">
                {!isAdding && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition"
                  >
                    Xoá
                  </button>
                )}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="bg-gray-300 px-4 py-2 rounded"
                  >
                    Huỷ
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition"
                  >
                    {isAdding ? "Thêm" : "Cập nhật"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default HomeroomDashboard;
