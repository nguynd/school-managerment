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
  <div className="w-[80%] h-[70%] p-5 font-montserrat flex flex-col ml-auto mt-10">
    <ToastContainer position="top-right" autoClose={2000} />

    {/* Bộ lọc học kỳ, năm học + nút thêm */}
    <div className="flex gap-2 mb-5">
      {["HK1", "HK2"].map((hky) => (
        <button
          key={hky}
          onClick={() => setSemester(hky)}
          className={`px-4 py-2 rounded-full font-bold transition-all ${
            semester === hky
              ? "bg-[#5a9cf3] text-white"
              : "bg-[#f0f0f0] text-[#676f86] hover:bg-[#d6e4ff]"
          }`}
        >
          {hky}
        </button>
      ))}

      <input
        type="number"
        value={year}
        onChange={(e) => setYear(parseInt(e.target.value))}
        className="px-4 py-2 rounded-full border font-bold text-[#676f86] w-24"
      />

      <button
        className="ml-auto px-5 py-2 bg-[#1470ef] text-white rounded font-bold hover:bg-[#218838] transition-colors"
        onClick={handleAddClick}
      >
        ➕ Thêm học sinh
      </button>
    </div>

    {/* Thông tin lớp */}
    <div className="mb-3 text-[#676f86] font-semibold text-sm">
      <p>Lớp chủ nhiệm: <span className="text-black font-bold">{data.class_name}</span></p>
      <p>Sĩ số: <span className="text-black font-bold">{students.length}</span></p>
      <p>Điểm TB lớp: <span className="text-black font-bold">{classAverage?.avg?.toFixed(2) ?? "..."}</span></p>
      <p>Xếp loại: <span className="text-black font-bold">{classAverage?.classification ?? "..."}</span></p>
    </div>

    {/* Bảng danh sách học sinh */}
    <table className="w-full border-collapse border border-[#e9f1fe] text-sm">
      <thead>
        <tr>
          <th className="bg-[#f8f9fd] text-[#676f86] border-b border-[#e9f1fe] px-3 py-2 text-left">#</th>
          <th className="bg-[#f8f9fd] text-[#676f86] border-b border-[#e9f1fe] px-3 py-2 text-left">Họ tên</th>
          <th className="bg-[#f8f9fd] text-[#676f86] border-b border-[#e9f1fe] px-3 py-2 text-left">Ngày sinh</th>
          <th className="bg-[#f8f9fd] text-[#676f86] border-b border-[#e9f1fe] px-3 py-2 text-left">ĐTB</th>
          <th className="bg-[#f8f9fd] text-[#676f86] border-b border-[#e9f1fe] px-3 py-2 text-left">Xếp loại</th>
          <th className="bg-[#f8f9fd] border-b border-[#e9f1fe] px-3 py-2 text-left"></th>
        </tr>
      </thead>
      <tbody>
        {students.length === 0 ? (
          <tr>
            <td colSpan="6" className="text-center p-4 text-gray-500">Chưa có học sinh nào.</td>
          </tr>
        ) : (
          students.map((s, idx) => (
            <tr key={s.id}>
              <td className="text-[#676f86] border-b border-[#e9f1fe] px-3 py-2">{idx + 1}</td>
              <td className="text-[#676f86] border-b border-[#e9f1fe] px-3 py-2">{s.name}</td>
              <td className="text-[#676f86] border-b border-[#e9f1fe] px-3 py-2">{new Date(s.date_of_birth).toLocaleDateString("vi-VN")}</td>
              <td className="text-[#676f86] border-b border-[#e9f1fe] px-3 py-2 text-center">{s.average ? Number(s.average).toFixed(2) : "-"}</td>
              <td className="text-[#676f86] border-b border-[#e9f1fe] px-3 py-2 text-center">{s.classification ?? "-"}</td>
              <td className="border-b border-[#e9f1fe] px-3 py-2">
                <button
                  onClick={() => {
                    setSelectedStudent({
                      ...s,
                      date_of_birth: new Date(s.date_of_birth).toISOString().split("T")[0],
                    });
                    setIsAdding(false);
                  }}
                >
                  <FiMoreVertical className="w-5 h-5 cursor-pointer text-gray-600 hover:text-black" />
                </button>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>

    {/* Modal sửa/thêm học sinh */}
    {(isAdding || selectedStudent) && (
      <EditStudent
        student={selectedStudent}
        onSave={handleSave}
        onDelete={handleDelete}
        onClose={handleClose}
        isAdding={isAdding}
      />
    )}
  </div>
);
}

export default HomeroomDashboard;
