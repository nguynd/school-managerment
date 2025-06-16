import { useEffect, useState, useRef } from "react";
import { FiMoreVertical } from "react-icons/fi";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import * as XLSX from "xlsx";
import Swal from "sweetalert2";
import HomeroomAPI from "../services/HomeroomAPI";

function HomeroomDashboard({ data }) {
  // ======= State =======
  const [students, setStudents] = useState([]);
  const [classAverage, setClassAverage] = useState(null);
  const [semester, setSemester] = useState("HK1");
  const [year, setYear] = useState(2024);
  const [viewMode, setViewMode] = useState("HK"); // HK | YEAR
  const [formData, setFormData] = useState({
    name: "",
    date_of_birth: "",
    gender: "",
    class_id: data?.class_id,
  });
  const [editId, setEditId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [guideModalOpen, setGuideModalOpen] = useState(false);
  const actionMenuRef = useRef();
  const fileInputRef = useRef();

  // ======= Data fetch =======
  const fetchStudents = async () => {
    if (!data?.class_id) return;
    if (viewMode === "YEAR") {
      await HomeroomAPI.generateYearlyGrades(data.class_id, year);
      const res = await HomeroomAPI.getYearlyGrades(data.class_id, year);
      setStudents(res);
    } else {
      const res = await HomeroomAPI.getStudentsWithGrading(
        data.class_id,
        semester,
        year
      );
      setStudents(res);
    }
  };

  useEffect(() => {
    fetchStudents();
    if (viewMode === "HK") {
      HomeroomAPI.getClassAverageScore(data.class_id, semester, year)
        .then(setClassAverage)
        .catch((err) => console.error("❌ Lỗi trung bình lớp:", err));
    } else {
      setClassAverage(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.class_id, semester, year, viewMode]);

  // ======= Helpers =======
  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    const d = new Date(dateString);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  // ======= CRUD Handlers =======
  const openAddModal = () => {
    setEditId(null);
    setFormData({ name: "", date_of_birth: "", gender: "", class_id: data.class_id });
    setIsModalOpen(true);
  };

  const openEditModal = (s) => {
    setEditId(s.id);
    setFormData({
      name: s.name,
      date_of_birth: formatDateForInput(s.date_of_birth),
      gender: s.gender || "",
      class_id: data.class_id,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Bạn có chắc chắn muốn xoá học sinh này?")) return;
    try {
      await HomeroomAPI.deleteStudent(id);
      await fetchStudents();
      toast.success("🗑️ Đã xoá học sinh");
    } catch (err) {
      toast.error("❌ Lỗi khi xoá học sinh");
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
      await fetchStudents();
    } catch (err) {
      toast.error("❌ Lỗi khi gửi dữ liệu");
    }
  };

  // ======= Excel import =======
  const handleExcelImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const wb = XLSX.read(evt.target.result, { type: "binary" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const dataJSON = XLSX.utils.sheet_to_json(ws, { defval: "" });

        const converted = dataJSON.map((row) => {
          // Parse date
          let dob = "";
          const raw = row["Ngày sinh"];
          if (raw) {
            if (typeof raw === "number") {
              const d = XLSX.SSF.parse_date_code(raw);
              if (d) dob = `${d.y}-${String(d.m).padStart(2, "0")}-${String(d.d).padStart(2, "0")}`;
            } else if (typeof raw === "string") {
              const [p1, p2, p3] = raw.split("/");
              let parsed = null;
              if (p1 && p2 && p3 && p1.length === 2) parsed = new Date(`${p2}/${p1}/${p3}`);
              else parsed = new Date(raw);
              if (!isNaN(parsed)) dob = parsed.toISOString().split("T")[0];
            }
          }
          return {
            name: row["Họ tên"]?.toString().trim() || "",
            date_of_birth: dob,
            gender: row["Giới tính"]?.toString().trim() || "",
            class_id: data.class_id,
          };
        });

        showPreviewPopup(converted);
      } catch (err) {
        console.error(err);
        toast.error("❌ Lỗi xử lý file Excel");
      } finally {
        e.target.value = null;
      }
    };
    reader.readAsBinaryString(file);
  };

  const showPreviewPopup = async (list) => {
    const hasErr = list.some((sv) => !sv.name || !sv.date_of_birth);
    const html = `
      <div style="max-height:300px;overflow:auto">
        <table style="width:100%;border-collapse:collapse">
          <thead>
            <tr>
              <th style="border:1px solid #ccc;padding:4px">Họ tên</th>
              <th style="border:1px solid #ccc;padding:4px">Ngày sinh</th>
              <th style="border:1px solid #ccc;padding:4px">Giới tính</th>
            </tr>
          </thead>
          <tbody>
            ${list
              .map(
                (sv) => `
              <tr style="${!sv.name || !sv.date_of_birth ? "background:#ffe5e5" : ""}">
                <td style="border:1px solid #ccc;padding:4px">${sv.name || "(thiếu)"}</td>
                <td style="border:1px solid #ccc;padding:4px">${sv.date_of_birth || "(thiếu)"}</td>
                <td style="border:1px solid #ccc;padding:4px">${sv.gender || "-"}</td>
              </tr>`
              )
              .join("")}
          </tbody>
        </table>
      </div>`;
    const res = await Swal.fire({
      title: hasErr ? "⚠️ Có lỗi, không thể thêm" : `Thêm ${list.length} học sinh?`,
      html,
      showCancelButton: true,
      showConfirmButton: !hasErr,
      confirmButtonText: "✅ Thêm",
      width: "800px",
    });
    if (!res.isConfirmed) return;
    let ok = 0;
    for (const sv of list) {
      if (!sv.name || !sv.date_of_birth) continue;
      try {
        await HomeroomAPI.createStudent(sv);
        ok++;
      } catch (err) {
        console.warn("Lỗi thêm:", sv.name, err);
      }
    }
    await fetchStudents();
    Swal.fire("Hoàn tất", `Đã thêm ${ok} học sinh`, "success");
  };

  // ======= JSX =======
  if (!data) return <p>Không chủ nhiệm lớp nào.</p>;

  return (
    <div className="w-full h-[70%] p-5 font-montserrat flex flex-col ml-auto mt-10">
      <ToastContainer position="top-right" autoClose={2000} />

      {/* Filter */}
      <div className="flex gap-2 mb-5 items-center">
        {["HK1", "HK2"].map((hk) => (
          <button
            key={hk}
            onClick={() => {
              setSemester(hk);
              setViewMode("HK");
            }}
            className={`px-4 py-2 rounded-full font-bold transition-all ${
              viewMode === "HK" && semester === hk
                ? "bg-[#5a9cf3] text-white"
                : "bg-[#f0f0f0] text-[#676f86] hover:bg-[#d6e4ff]"
            }`}
          >
            {hk}
          </button>
        ))}
        <button
          onClick={() => setViewMode("YEAR")}
          className={`px-4 py-2 rounded-full font-bold transition-all ${
            viewMode === "YEAR"
              ? "bg-[#5a9cf3] text-white"
              : "bg-[#f0f0f0] text-[#676f86] hover:bg-[#d6e4ff]"
          }`}
        >
          📘 Tổng kết
        </button>
        <input
          type="number"
          value={year}
          onChange={(e) => setYear(parseInt(e.target.value))}
          className="px-4 py-2 rounded-full border font-bold text-[#676f86] w-24"
        />
        <button
          className="ml-auto px-5 py-2 bg-[#1470ef] text-white rounded font-bold hover:bg-[#218838]"
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
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls"
          onChange={handleExcelImport}
          className="hidden"
        />
        <button
          onClick={() => setGuideModalOpen(true)}
          className="px-5 py-2 bg-yellow-500 text-white rounded font-bold hover:bg-yellow-600"
        >
          ❓ Hướng dẫn
        </button>
      </div>

      {/* Class info */}
      <div className="mb-3 text-[#676f86] font-semibold text-sm">
        <p>
          Lớp chủ nhiệm: <span className="text-black font-bold">{data.class_name}</span>
        </p>
        <p>
          Sĩ số: <span className="text-black font-bold">{students.length}</span>
        </p>
        <p>
          Điểm TB lớp:{" "}
          <span className="text-black font-bold">
            {classAverage?.avg?.toFixed(2) ?? "..."}
          </span>
        </p>
        <p>
          Xếp loại:{" "}
          <span className="text-black font-bold">
            {classAverage?.classification ?? "..."}
          </span>
        </p>
      </div>

      {/* Table */}
      <table className="w-full border-collapse border border-[#e9f1fe] text-sm">
        <thead>
          <tr>
            <th className="bg-[#f8f9fd] text-[#676f86] border-b border-[#e9f1fe] px-3 py-2 text-left">
              #
            </th>
            <th className="bg-[#f8f9fd] text-[#676f86] border-b border-[#e9f1fe] px-3 py-2 text-left">
              Họ tên
            </th>
            <th className="bg-[#f8f9fd] text-[#676f86] border-b border-[#e9f1fe] px-3 py-2 text-left">
              Ngày sinh
            </th>
            <th className="bg-[#f8f9fd] text-[#676f86] border-b border-[#e9f1fe] px-3 py-2 text-left">
              ĐTB
            </th>
            <th className="bg-[#f8f9fd] text-[#676f86] border-b border-[#e9f1fe] px-3 py-2 text-left">
              Xếp loại
            </th>
            <th className="bg-[#f8f9fd] text-[#676f86] border-b border-[#e9f1fe] px-3 py-2 text-left">
              Giới tính
            </th>
            <th className="bg-[#f8f9fd] border-b border-[#e9f1fe] px-3 py-2 text-left"></th>
          </tr>
        </thead>
        <tbody>
          {students.length === 0 ? (
            <tr>
              <td colSpan="7" className="text-center text-gray-500 p-4">
                Chưa có học sinh nào.
              </td>
            </tr>
          ) : (
            [...students]
              .sort((a, b) => {
                const aParts = a.name.trim().split(" ");
                const bParts = b.name.trim().split(" ");
                const cmpLast = aParts.at(-1).localeCompare(bParts.at(-1), "vi");
                if (cmpLast !== 0) return cmpLast;
                return a.name.localeCompare(b.name, "vi");
              })
              .map((s, idx) => (
                <tr key={s.id}>
                  <td className="text-[#676f86] border-b border-[#e9f1fe] px-3 py-2">{idx + 1}</td>
                  <td className="text-[#676f86] border-b border-[#e9f1fe] px-3 py-2">{s.name}</td>
                  <td className="text-[#676f86] border-b border-[#e9f1fe] px-3 py-2">
                    {new Date(s.date_of_birth).toLocaleDateString("vi-VN")}
                  </td>
                  <td className="text-[#676f86] border-b border-[#e9f1fe] px-3 py-2">
                    {viewMode === "YEAR"
                      ? s.year_score?.toFixed(2) ?? "-"
                      : s.average?.toFixed(2) ?? "-"}
                  </td>
                  <td className="text-[#676f86] border-b border-[#e9f1fe] px-3 py-2">
                    {viewMode === "YEAR" ? s.year_grade ?? "-" : s.classification ?? "-"}
                  </td>
                  <td className="text-[#676f86] border-b border-[#e9f1fe] px-3 py-2">
                    {s.gender || "-"}
                  </td>
                  <td className="border-b border-[#e9f1fe] px-3 py-2">
                    <button
                      onClick={() => openEditModal(s)}
                      className="hover:bg-gray-100 p-2 rounded-full"
                    >
                      <FiMoreVertical className="w-5 h-5 text-gray-600 hover:text-black" />
                    </button>
                  </td>
                </tr>
              ))
          )}
        </tbody>
      </table>

      {/* Modal CRUD */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md">
            <h3 className="text-xl font-bold mb-5">
              {editId ? "✏️ Sửa học sinh" : "➕ Thêm học sinh"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
              <div>
                <label className="block font-medium mb-1">Họ tên:</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="border px-3 py-2 rounded w-full"
                  required
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Ngày sinh:</label>
                <input
                  type="date"
                  value={formData.date_of_birth}
                  onChange={(e) =>
                    setFormData({ ...formData, date_of_birth: e.target.value })
                  }
                  className="border px-3 py-2 rounded w-full"
                  required
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Giới tính:</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="border px-3 py-2 rounded w-full"
                  required
                >
                  <option value="">-- Chọn --</option>
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                </select>
              </div>
              <div className="flex justify-between pt-4">
                {editId && (
                  <button
                    type="button"
                    onClick={() => handleDelete(editId)}
                    className="bg-red-500 text-white px-4 py-2 rounded"
                  >
                    Xoá
                  </button>
                )}
                <div className="ml-auto flex gap-2">
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
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Guide Modal */}
      {guideModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl max-w-lg w-full">
            <h3 className="text-lg font-bold mb-4">📘 Hướng dẫn nhập Excel</h3>
            <p className="mb-2">File Excel cần có cột:</p>
            <ul className="list-disc ml-6 mb-4 text-sm">
              <li><b>Họ tên</b></li>
              <li><b>Ngày sinh</b> (yyyy-mm-dd hoặc dd/mm/yyyy)</li>
              <li><b>Giới tính</b> (Nam/Nữ)</li>
            </ul>
            <p className="text-red-600 text-sm mb-4">Thiếu cột sẽ báo lỗi.</p>
            <div className="text-right">
              <button
                onClick={() => setGuideModalOpen(false)}
                className="bg-blue-500 text-white px-4 py-2 rounded"
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
