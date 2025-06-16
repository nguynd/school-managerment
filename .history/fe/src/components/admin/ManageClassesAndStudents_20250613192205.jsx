import { useEffect, useState, useRef } from "react";
import AdminAPI from "../../services/AdminAPI";
import * as XLSX from "xlsx";
import Swal from "sweetalert2";

function ManageClassesAndStudents() {
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [students, setStudents] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(""); // addClass | editClass | addStudent | editStudent
  const [formData, setFormData] = useState({ name: "", date_of_birth: "", gender: "" });
  const [teacherId, setTeacherId] = useState("");
  const [editingItem, setEditingItem] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchClasses();
    fetchTeachers();
  }, []);

  const fetchClasses = async () => {
    const res = await AdminAPI.getAllClasses();
    setClasses(res || []);
  };

  const fetchTeachers = async () => {
    const res = await AdminAPI.getAllTeachers();
    setTeachers(res || []);
  };

  const fetchStudents = async (classId) => {
    const res = await AdminAPI.getStudentsByClass(classId);
    setStudents(res || []);
  };

  const formatDateForInput = (dateString) => {
    const d = new Date(dateString);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };
  const openModal = (type, item = null) => {
    setModalType(type);
    setEditingItem(item);
    if (type.includes("Class")) {
      setFormData({ name: item?.name || "" });
      setTeacherId(item?.teacher_id?.toString() || "");
    } else {
      setFormData({
        name: item?.name || "",
        date_of_birth: item?.date_of_birth ? formatDateForInput(item.date_of_birth) : "",
        gender: item?.gender || "",
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingItem(null);
    setFormData({ name: "", date_of_birth: "", gender: "" });
    setTeacherId("");
  };

  const handleModalSubmit = async () => {
    try {
      if (modalType === "addClass") {
        await AdminAPI.createClass({ name: formData.name, teacher_id: teacherId || null });
        fetchClasses();
      } else if (modalType === "editClass") {
        await AdminAPI.updateClass(editingItem.id, { name: formData.name, teacher_id: teacherId || null });
        fetchClasses();
      } else if (modalType === "addStudent") {
        await AdminAPI.createStudent({ ...formData, class_id: selectedClass.id });
        fetchStudents(selectedClass.id);
      } else if (modalType === "editStudent") {
        await AdminAPI.updateStudent(editingItem.id, formData);
        fetchStudents(selectedClass.id);
      }
      closeModal();
    } catch (err) {
      alert("❌ Lỗi khi gửi dữ liệu");
    }
  };

  const handleDeleteClass = async (id) => {
    if (confirm("Bạn có chắc chắn xoá lớp này?")) {
      await AdminAPI.deleteClass(id);
      fetchClasses();
    }
  };

  const handleDeleteStudent = async (id) => {
    if (confirm("Xoá học sinh này?")) {
      await AdminAPI.deleteStudent(id);
      fetchStudents(selectedClass.id);
    }
  };
  const handleExcelImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const wb = XLSX.read(evt.target.result, { type: "binary" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(ws, { defval: "" });

        const list = data.map((row) => {
          let dob = "";
          const raw = row["Ngày sinh"];

          if (typeof raw === "number") {
            const d = XLSX.SSF.parse_date_code(raw);
            if (d) dob = `${d.y}-${String(d.m).padStart(2, "0")}-${String(d.d).padStart(2, "0")}`;
          } else if (typeof raw === "string") {
            const parts = raw.split("/");
            let parsed = null;
            if (parts.length === 3 && parts[0].length === 2) {
              parsed = new Date(`${parts[1]}/${parts[0]}/${parts[2]}`);
            } else parsed = new Date(raw);
            if (!isNaN(parsed)) dob = parsed.toISOString().split("T")[0];
          }

          return {
            name: row["Họ tên"]?.toString().trim(),
            date_of_birth: dob,
            gender: row["Giới tính"]?.toString().trim() || "",
            class_id: selectedClass.id,
          };
        });

        showPreviewPopup(list);
      } catch (err) {
        alert("Lỗi đọc file Excel!");
        console.error(err);
      } finally {
        e.target.value = null;
      }
    };
    reader.readAsBinaryString(file);
  };

  const showPreviewPopup = async (studentsList) => {
    const hasErr = studentsList.some((s) => !s.name || !s.date_of_birth);

    const html = `
      <div style="max-height:300px;overflow:auto;text-align:left">
        <table style="width:100%;border-collapse:collapse">
          <thead><tr>
            <th style="border:1px solid #ccc;padding:4px">Họ tên</th>
            <th style="border:1px solid #ccc;padding:4px">Ngày sinh</th>
            <th style="border:1px solid #ccc;padding:4px">Giới tính</th>
          </tr></thead>
          <tbody>
            ${studentsList
              .map((sv) => {
                const style = !sv.name || !sv.date_of_birth ? "background:#ffe5e5;color:#d00;font-weight:bold" : "";
                return `
                  <tr style="${style}">
                    <td style="border:1px solid #ccc;padding:4px">${sv.name || "(Thiếu)"}</td>
                    <td style="border:1px solid #ccc;padding:4px">${sv.date_of_birth || "(Thiếu)"}</td>
                    <td style="border:1px solid #ccc;padding:4px">${sv.gender || "-"}</td>
                  </tr>
                `;
              })
              .join("")}
          </tbody>
        </table>
      </div>
    `;

    const res = await Swal.fire({
      title: hasErr ? "⚠️ Có dữ liệu thiếu!" : `Thêm ${studentsList.length} học sinh?`,
      html,
      showCancelButton: true,
      showConfirmButton: !hasErr,
      confirmButtonText: "✅ Thêm",
      cancelButtonText: hasErr ? "Đóng" : "Hủy",
      width: "800px",
    });

    if (res.isConfirmed) {
      let ok = 0;
      for (const sv of studentsList) {
        if (sv.name && sv.date_of_birth) {
          try {
            await AdminAPI.createStudent(sv);
            ok++;
          } catch {}
        }
      }
      await fetchStudents(selectedClass.id);
      Swal.fire("Hoàn tất", `Đã thêm ${ok} / ${studentsList.length} học sinh`, "success");
    }
  };
  if (selectedClass) {
    return (
      <div className="ml-64 p-4 mt-20">
        <button onClick={() => setSelectedClass(null)} className="mb-4 px-3 py-1 border rounded text-sm">
          ← Quay lại danh sách lớp
        </button>

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Học sinh lớp {selectedClass.name}</h2>
          <div className="flex gap-2">
            <button onClick={() => openModal("addStudent")} className="px-4 py-2 bg-green-600 text-white rounded">
              ➕ Thêm học sinh
            </button>
            <button onClick={() => fileInputRef.current?.click()} className="px-4 py-2 bg-emerald-600 text-white rounded">
              📥 Nhập Excel
            </button>
            <input ref={fileInputRef} type="file" accept=".xlsx, .xls" onChange={handleExcelImport} className="hidden" />
          </div>
        </div>

        <table className="w-full border-collapse border text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">#</th>
              <th className="p-2 border">Họ tên</th>
              <th className="p-2 border">Ngày sinh</th>
              <th className="p-2 border">Giới tính</th>
              <th className="p-2 border w-20">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s, i) => (
              <tr key={s.id}>
                <td className="p-2 border">{i + 1}</td>
                <td className="p-2 border">{s.name}</td>
                <td className="p-2 border">{new Date(s.date_of_birth).toLocaleDateString("vi-VN")}</td>
                <td className="p-2 border">{s.gender || "-"}</td>
                <td className="p-2 border text-center space-x-2">
                  <button onClick={() => openModal("editStudent", s)}>✏️</button>
                  <button onClick={() => handleDeleteStudent(s.id)}>🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {showModal && (
          <Modal
            type={modalType}
            teachers={teachers}
            formData={formData}
            setFormData={setFormData}
            teacherId={teacherId}
            setTeacherId={setTeacherId}
            onCancel={closeModal}
            onSave={handleModalSubmit}
          />
        )}
      </div>
    );
  }

  return (
    <div className="ml-64 p-4 mt-20">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Danh sách lớp</h2>
        <button onClick={() => openModal("addClass")} className="px-4 py-2 bg-blue-600 text-white rounded">
          ➕ Thêm lớp
        </button>
      </div>

      <table className="w-full border-collapse text-sm border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">#</th>
            <th className="p-2 border">Tên lớp</th>
            <th className="p-2 border">GVCN</th>
            <th className="p-2 border">Sĩ số</th>
            <th className="p-2 border w-24">Hành động</th>
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
              <td className="p-2 border">{cl.teacher_name || "—"}</td>
              <td className="p-2 border">{cl.student_count}</td>
              <td className="p-2 border text-center space-x-2" onClick={(e) => e.stopPropagation()}>
                <button onClick={() => openModal("editClass", cl)}>✏️</button>
                <button onClick={() => handleDeleteClass(cl.id)}>🗑️</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showModal && (
        <Modal
          type={modalType}
          teachers={teachers}
          formData={formData}
          setFormData={setFormData}
          teacherId={teacherId}
          setTeacherId={setTeacherId}
          onCancel={closeModal}
          onSave={handleModalSubmit}
        />
      )}
    </div>
  );
function Modal({ type, teachers, formData, setFormData, teacherId, setTeacherId, onCancel, onSave }) {
  const isClass = type.includes("Class");

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded shadow-md w-[340px]">
        <h3 className="text-lg font-semibold mb-4">
          {type.startsWith("add") ? "Thêm" : "Sửa"} {isClass ? "lớp" : "học sinh"}
        </h3>

        {isClass ? (
          <>
            <label className="block text-sm mb-1">Tên lớp</label>
            <input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full border px-3 py-2 mb-4"
              required
            />

            <label className="block text-sm mb-1">Giáo viên chủ nhiệm</label>
            <select
              value={teacherId}
              onChange={(e) => setTeacherId(e.target.value)}
              className="w-full border px-3 py-2 mb-4"
            >
              <option value="">— Chưa chọn —</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id.toString()}>
                  {t.name}
                </option>
              ))}
            </select>
          </>
        ) : (
          <>
            <label className="block text-sm mb-1">Họ tên</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full border px-3 py-2 mb-4"
              required
            />

            <label className="block text-sm mb-1">Ngày sinh</label>
            <input
              type="date"
              value={formData.date_of_birth}
              onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
              className="w-full border px-3 py-2 mb-4"
              required
            />

            <label className="block text-sm mb-1">Giới tính</label>
            <select
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              className="w-full border px-3 py-2 mb-4"
              required
            >
              <option value="">-- Chọn giới tính --</option>
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
            </select>
          </>
        )}

        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onCancel} className="px-3 py-1 border rounded">
            Huỷ
          </button>
          <button onClick={onSave} className="px-3 py-1 bg-blue-600 text-white rounded">
            Lưu
          </button>
        </div>
      </div>
    </div>
  );
}

export default ManageClassesAndStudents;
