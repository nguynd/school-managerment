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

  const [formData, setFormData] = useState({ name: "", date_of_birth: "", class_id: data?.class_id });
  const [editId, setEditId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [guideModalOpen, setGuideModalOpen] = useState(false);
  const [actionMenuOpenId, setActionMenuOpenId] = useState(null);
  const actionMenuRef = useRef();

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
    setFormData({ name: "", date_of_birth: "", class_id: data.class_id });
    setIsModalOpen(true);
  };

  const openEditModal = (s) => {
    setFormData({
      name: s.name,
      date_of_birth: formatDateForInput(s.date_of_birth),
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
          try {
            const raw = row["Ngày sinh"];
            if (raw) {
              const parsed = new Date(raw);
              if (!isNaN(parsed)) {
                date_of_birth = parsed.toISOString().split("T")[0];
              }
            }
          } catch {
            date_of_birth = "";
          }

          return {
            name: row["Họ tên"]?.toString().trim() || "",
            date_of_birth,
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

        <label htmlFor="excelInput">
          <button className="px-5 py-2 bg-green-500 text-white rounded font-bold hover:bg-green-600">
            📥 Nhập Excel
          </button>
        </label>
        <input
          type="file"
          accept=".xlsx, .xls"
          onChange={handleExcelImport}
          className="hidden"
          id="excelInput"
        />

        <button
          onClick={() => setGuideModalOpen(true)}
          className="px-5 py-2 bg-yellow-500 text-white rounded font-bold hover:bg-yellow-600"
        >
          ❓ Hướng dẫn
        </button>
      </div>

      {/* ...Phần còn lại giữ nguyên (table, modal, hướng dẫn...) */}
    </div>
  );
}

export default HomeroomDashboard;
