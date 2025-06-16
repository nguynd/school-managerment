import { useEffect, useState, useRef } from "react";
import { FiMoreVertical } from "react-icons/fi";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import * as XLSX from "xlsx";
import Swal from "sweetalert2";
import HomeroomAPI from "../services/HomeroomAPI";

function HomeroomDashboard({ data }) {
  const [students, setStudents] = useState([]);
  const [classAverage, setClassAverage] = useState(null);
  const [semester, setSemester] = useState("HK1");
  const [year, setYear] = useState(2024);

  const [formData, setFormData] = useState({
  name: "",
  date_of_birth: "",
  gender: "",
  class_id: data?.class_id,
});
  const [editId, setEditId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [guideModalOpen, setGuideModalOpen] = useState(false);
  const [actionMenuOpenId, setActionMenuOpenId] = useState(null);
  const actionMenuRef = useRef();
  const fileInputRef = useRef();

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

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (actionMenuRef.current && !actionMenuRef.current.contains(e.target)) {
        setActionMenuOpenId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatDateForInput = (dateString) => {
    const d = new Date(dateString);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const openAddModal = () => {
    setEditId(null);
    setFormData({ name: "", date_of_birth: "", gender: "", class_id: data.class_id });
    setIsModalOpen(true);
  };

  const openEditModal = (s) => {
    setFormData({
  name: s.name,
  date_of_birth: formatDateForInput(s.date_of_birth),
  gender: s.gender || "",
  class_id: data.class_id,
});
    setEditId(s.id);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (confirm("Bạn có chắc chắn muốn xoá học sinh này?")) {
      try {
        await HomeroomAPI.deleteStudent(id);
        fetchStudents();
        toast.success("🗑️ Đã xoá học sinh");
      } catch (err) {
        toast.error("❌ Lỗi khi xoá học sinh");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await HomeroomAPI.updateStudent(editId, formData);
        toast.success("✅ Cập nhật học sinh thành công");
      } else {
        await HomeroomAPI.createStudent(formData);
        toast.success("✅ Thêm học sinh thành công");
      }
      setIsModalOpen(false);
      setEditId(null);
      fetchStudents();
    } catch (err) {
      toast.error("❌ Lỗi khi gửi dữ liệu");
    }
  };

 const handleExcelImport = async (e) => {
  console.log("📥 Bắt đầu xử lý file Excel");
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async (event) => {
    try {
      const workbook = XLSX.read(event.target.result, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

      const studentsToAdd = jsonData.map((row) => {
        let date_of_birth = "";
        const raw = row["Ngày sinh"];

        // Xử lý ngày sinh
        if (raw) {
          // Trường hợp: Excel serial (số)
          if (typeof raw === "number") {
            const dateObj = XLSX.SSF.parse_date_code(raw);
            if (dateObj) {
              const { y, m, d } = dateObj;
              date_of_birth = `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
            }
          }

          // Trường hợp: Chuỗi "dd/mm/yyyy" hoặc "yyyy-mm-dd"
          else if (typeof raw === "string") {
            // Thử parse định dạng dd/mm/yyyy
            const [part1, part2, part3] = raw.split("/");
            let parsedDate;

            if (part1 && part2 && part3 && part1.length === 2) {
              // Chuyển thành mm/dd/yyyy để Date() hiểu
              parsedDate = new Date(`${part2}/${part1}/${part3}`);
            } else {
              // Thử parse trực tiếp
              parsedDate = new Date(raw);
            }

            if (!isNaN(parsedDate)) {
              date_of_birth = parsedDate.toISOString().split("T")[0];
            }
          }
        }

        return {
          name: row["Họ tên"]?.toString().trim() || "",
          date_of_birth,
          gender: row["Giới tính"]?.toString().trim() || "",
          class_id: data.class_id,
        };
      });

      showPreviewPopup(studentsToAdd);
    } catch (err) {
      console.error("❌ Lỗi khi đọc file Excel:", err);
      toast.error("❌ Lỗi khi xử lý file Excel");
    } finally {
      e.target.value = null;
    }
  };

  reader.readAsBinaryString(file);
};


  const showPreviewPopup = async (students) => {
    const hasError = students.some(
      (sv) => !sv.name || !sv.date_of_birth
    );

    const html = `
      <div style="max-height:300px;overflow:auto;text-align:left">
        <table style="width:100%;border-collapse:collapse">
          <thead><tr>
            <th style="border:1px solid #ccc;padding:4px">Họ tên</th>
            <th style="border:1px solid #ccc;padding:4px">Ngày sinh</th>
          </tr></thead>
          <tbody>
            ${students
              .map((sv) => {
                const isInvalid = !sv.name || !sv.date_of_birth;
                const rowStyle = isInvalid
                  ? "background:#ffe5e5;color:#d00;font-weight:bold;"
                  : "";
                return `
                <tr style="${rowStyle}">
                  <td style="border:1px solid #ccc;padding:4px">${sv.name || "(Thiếu)"}</td>
                  <td style="border:1px solid #ccc;padding:4px">${sv.date_of_birth || "(Thiếu)"}</td>
                </tr>
                `;
              })
              .join("")}
          </tbody>
        </table>
      </div>
    `;

    const result = await Swal.fire({
      title: hasError
        ? "⚠️ Có lỗi trong dữ liệu, không thể thêm"
        : `Xác nhận thêm ${students.length} học sinh?`,
      html,
      showCancelButton: true,
      showConfirmButton: !hasError,
      confirmButtonText: "✅ Thêm tất cả",
      cancelButtonText: hasError ? "Đóng" : "❌ Hủy",
      width: "800px",
    });

    if (result.isConfirmed) {
      let successCount = 0;
      for (const student of students) {
        if (student.name && student.date_of_birth) {
          try {
            await HomeroomAPI.createStudent(student);
            successCount++;
          } catch (err) {
            console.warn("Không thể thêm:", student.name, err);
          }
        }
      }
      await fetchStudents();
      Swal.fire("Hoàn tất", `Đã thêm ${successCount} học sinh thành công`, "success");
    }
  };

  if (!data) return <p>Không chủ nhiệm lớp nào.</p>;

  return (
    <div className="w-[100%] h-[70%] p-5 font-montserrat flex flex-col ml-auto mt-10">
      <ToastContainer position="top-right" autoClose={2000} />

      {/* Bộ lọc */}
      <div className="flex gap-2 mb-5 items-center">
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
          onClick={openAddModal}
        >
          ➕ Thêm học sinh
        </button>

        <button
  onClick={() => fileInputRef.current?.click()}
  className="px-5 py-2 bg-green-500 text-white rounded font-bold hover:bg-green-600"
>
  📥 Nhập Excel
</button>

<input
  type="file"
  ref={fileInputRef}
  onChange={handleExcelImport}
  accept=".xlsx, .xls"
  className="hidden"
/>

        <button
          onClick={() => setGuideModalOpen(true)}
          className="px-5 py-2 bg-yellow-500 text-white rounded font-bold hover:bg-yellow-600"
        >
          ❓ Hướng dẫn
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
            <th className="bg-[#f8f9fd] text-[#676f86] border-b border-[#e9f1fe] px-3 py-2 text-left">Giới tính</th>
            <th className="bg-[#f8f9fd] border-b border-[#e9f1fe] px-3 py-2 text-left"></th>
          </tr>
        </thead>
        <tbody>
          {students.length === 0 ? (
            <tr>
              <td colSpan="6" className="text-center text-gray-500 p-4">Chưa có học sinh nào.</td>
            </tr>
          ) : (
            students.map((s, idx) => (
              <tr key={s.id}>
                <td className="text-[#676f86] border-b border-[#e9f1fe] px-3 py-2">{idx + 1}</td>
                <td className="text-[#676f86] border-b border-[#e9f1fe] px-3 py-2">{s.name}</td>
                <td className="text-[#676f86] border-b border-[#e9f1fe] px-3 py-2">
                  {new Date(s.date_of_birth).toLocaleDateString("vi-VN")}
                </td>
                <td className="text-[#676f86] border-b border-[#e9f1fe] px-3 py-2">
                  {s.average ? Number(s.average).toFixed(2) : "-"}
                </td>
                <td className="text-[#676f86] border-b border-[#e9f1fe] px-3 py-2">
                  {s.classification ?? "-"}
                </td>
                <td className="text-[#676f86] border-b border-[#e9f1fe] px-3 py-2">
                  {s.gender || "-"}
                </td>
                <td className="border-b border-[#e9f1fe] px-3 py-2">
                  <button
                    onClick={() => openEditModal(s)}
                    className="hover:bg-gray-100 p-2 rounded-full"
                    title="Sửa học sinh"
                  >
                    <FiMoreVertical className="w-5 h-5 text-gray-600 hover:text-black" />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Modal thêm/sửa học sinh */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md font-montserrat">
            <h3 className="text-xl font-bold text-[#333] mb-5">
              {editId ? "✏️ Sửa học sinh" : "➕ Thêm học sinh"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
              <div>
                <label className="block text-gray-600 font-medium mb-1">Họ tên:</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="border px-3 py-2 rounded w-full"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-600 font-medium mb-1">Ngày sinh:</label>
                <input
                  type="date"
                  value={formData.date_of_birth}
                  onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                  className="border px-3 py-2 rounded w-full"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-600 font-medium mb-1">Giới tính:</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="border px-3 py-2 rounded w-full"
                  required
                >
                  <option value="">-- Chọn giới tính --</option>
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                </select>
              </div>
              <div className="flex justify-between items-center pt-4">
                {editId && (
                  <button
                    type="button"
                    onClick={() => handleDelete(editId)}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded font-bold"
                  >
                    Xoá
                  </button>
                )}
                <div className="flex gap-2 ml-auto">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="bg-gray-300 px-4 py-2 rounded font-semibold"
                  >
                    Huỷ
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded font-bold"
                  >
                    {editId ? "Cập nhật" : "Thêm"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal hướng dẫn nhập Excel */}
      {guideModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-lg font-montserrat">
            <h3 className="text-lg font-bold mb-4">📘 Hướng dẫn nhập Excel</h3>
            <p className="text-sm mb-2">Bạn cần chuẩn bị file Excel với các cột sau:</p>
            <ul className="list-disc ml-6 text-sm text-gray-700 mb-4">
              <li><strong>Họ tên</strong> – Tên đầy đủ học sinh</li>
              <li><strong>Ngày sinh</strong> – Dạng <code>yyyy-mm-dd</code> hoặc <code>dd/mm/yyyy</code></li>
            </ul>
            <p className="text-sm text-red-600 mb-4">⚠️ Nếu thiếu cột, hệ thống sẽ báo lỗi và không xử lý.</p>
            <div className="text-right">
              <button
                onClick={() => setGuideModalOpen(false)}
                className="bg-blue-500 text-white px-4 py-2 rounded font-bold hover:bg-blue-600"
              >
                Đã hiểu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HomeroomDashboard;
