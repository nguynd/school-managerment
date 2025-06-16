import { useEffect, useRef, useState } from "react";
import AdminAPI from "../../services/AdminAPI";
import * as XLSX from "xlsx";
import Swal from "sweetalert2";

function ManageClassesAndStudents() {
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [students, setStudents] = useState([]);

  // modal state
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(""); // addClass | editClass | addStudent | editStudent
  const [nameInput, setNameInput] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [editingItem, setEditingItem] = useState(null);

  const fileInputRef = useRef();

  /* ----------------- FETCH ----------------- */
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

  useEffect(() => {
    fetchClasses();
    fetchTeachers();
  }, []);

  /* ------------ SORT NAME VIETNAMESE ------------ */
  const sortStudentsByName = (a, b) => {
    const splitA = a.name.trim().split(" ");
    const splitB = b.name.trim().split(" ");
    const cmpLast = splitA.at(-1).localeCompare(splitB.at(-1), "vi");
    if (cmpLast !== 0) return cmpLast;

    // compare middle names from right to left
    const midA = splitA.slice(1, -1);
    const midB = splitB.slice(1, -1);
    const max = Math.max(midA.length, midB.length);
    for (let i = 1; i <= max; i++) {
      const mA = midA[midA.length - i] || "";
      const mB = midB[midB.length - i] || "";
      const cmp = mA.localeCompare(mB, "vi");
      if (cmp !== 0) return cmp;
    }

    const cmpFirst = splitA[0].localeCompare(splitB[0], "vi");
    return cmpFirst !== 0 ? cmpFirst : a.id - b.id;
  };

  /* ---------------- MODAL ---------------- */
  const openModal = (type, item = null) => {
    setModalType(type);
    setEditingItem(item);
    setNameInput(item?.name || "");
    setTeacherId(item?.teacher_id || "");
    setDateOfBirth(item?.date_of_birth?.slice(0, 10) || "");
    setGender(item?.gender || "");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setNameInput("");
    setTeacherId("");
    setDateOfBirth("");
    setGender("");
    setEditingItem(null);
  };

  const handleModalSubmit = async () => {
    if (!nameInput.trim()) return;

    try {
      switch (modalType) {
        case "addClass":
          await AdminAPI.createClass({ name: nameInput.trim(), teacher_id: teacherId || null });
          await fetchClasses();
          await Swal.fire("✅ Thành công", "Đã thêm lớp học", "success");
          break;
        case "editClass":
          await AdminAPI.updateClass(editingItem.id, { name: nameInput.trim(), teacher_id: teacherId || null });
          await fetchClasses();
          await Swal.fire("✅ Thành công", "Đã cập nhật lớp học", "success");
          break;
        case "addStudent":
          await AdminAPI.createStudent({
            name: nameInput.trim(),
            date_of_birth: dateOfBirth,
            gender,
            class_id: selectedClass.id,
          });
          await fetchStudents(selectedClass.id);
          await Swal.fire("✅ Thành công", "Đã thêm học sinh", "success");
          break;
        case "editStudent":
          await AdminAPI.updateStudent(editingItem.id, {
            name: nameInput.trim(),
            date_of_birth: dateOfBirth,
            gender,
          });
          await fetchStudents(selectedClass.id);
          await Swal.fire("✅ Thành công", "Đã cập nhật học sinh", "success");
          break;
        default:
          break;
      }
    } catch {
      Swal.fire("❌ Lỗi", "Đã có lỗi xảy ra", "error");
    }
    closeModal();
  };

  /* -------------- DELETE WITH CONFIRM -------------- */
  const handleDeleteClass = async (id) => {
    const { isConfirmed } = await Swal.fire({
      title: "Bạn có chắc muốn xoá lớp này?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "🗑️ Xoá",
      cancelButtonText: "Huỷ",
    });
    if (isConfirmed) {
      await AdminAPI.deleteClass(id);
      await fetchClasses();
      Swal.fire("✅ Đã xoá", "Lớp học đã được xoá", "success");
    }
  };

  const handleDeleteStudent = async (id) => {
    const { isConfirmed } = await Swal.fire({
      title: "Xoá học sinh này?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "🗑️ Xoá",
      cancelButtonText: "Huỷ",
    });
    if (isConfirmed) {
      await AdminAPI.deleteStudent(id);
      await fetchStudents(selectedClass.id);
      Swal.fire("✅ Đã xoá", "Học sinh đã được xoá", "success");
    }
  };

  /* ----------- EXCEL IMPORT ----------- */
  const handleExcelImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const workbook = XLSX.read(event.target.result, { type: "binary" });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

        const studentsToAdd = jsonData.map((row) => {
          let date_of_birth = "";
          const raw = row["Ngày sinh"];

          if (typeof raw === "number") {
            const obj = XLSX.SSF.parse_date_code(raw);
            if (obj) date_of_birth = `${obj.y}-${String(obj.m).padStart(2, "0")}-${String(obj.d).padStart(2, "0")}`;
          } else if (typeof raw === "string") {
            const [d, m, y] = raw.split("/");
            const parsed = d && m && y && d.length === 2 ? new Date(`${m}/${d}/${y}`) : new Date(raw);
            if (!isNaN(parsed)) date_of_birth = parsed.toISOString().split("T")[0];
          }

          return {
            name: row["Họ tên"]?.toString().trim() || "",
            date_of_birth,
            gender: row["Giới tính"]?.toString().trim() || "",
            class_id: selectedClass?.id,
          };
        });

        showPreviewPopup(studentsToAdd);
      } catch {
        Swal.fire("❌ Lỗi", "Không thể đọc file Excel", "error");
      } finally {
        e.target.value = null;
      }
    };
    reader.readAsBinaryString(file);
  };

  /* --------- PREVIEW & BULK INSERT --------- */
  const showPreviewPopup = async (students) => {
    const hasError = students.some((s) => !s.name || !s.date_of_birth);

    const html = `
      <div style="max-height:300px;overflow:auto;text-align:left">
        <table style="width:100%;border-collapse:collapse">
          <thead><tr>
            <th style="border:1px solid #ccc;padding:4px">Họ tên</th>
            <th style="border:1px solid #ccc;padding:4px">Ngày sinh</th>
            <th style="border:1px solid #ccc;padding:4px">Giới tính</th>
          </tr></thead>
          <tbody>
            ${students
              .map((s) => {
                const err = !s.name || !s.date_of_birth;
                return `
                  <tr style="${err ? "background:#ffe5e5;color:#d00;" : ""}">
                    <td style="border:1px solid #ccc;padding:4px">${s.name || "(Thiếu)"}</td>
                    <td style="border:1px solid #ccc;padding:4px">${s.date_of_birth || "(Thiếu)"}</td>
                    <td style="border:1px solid #ccc;padding:4px">${s.gender || "-"}</td>
                  </tr>`;
              })
              .join("")}
          </tbody>
        </table>
      </div>
    `;

    const { isConfirmed } = await Swal.fire({
      title: hasError ? "⚠️ Có lỗi, không thể thêm" : `Thêm ${students.length} học sinh?`,
      html,
      showCancelButton: true,
      showConfirmButton: !hasError,
      confirmButtonText: "✅ Thêm tất cả",
      cancelButtonText: hasError ? "Đóng" : "❌ Huỷ",
      width: "800px",
    });

    if (isConfirmed) {
      let success = 0;
      for (const s of students) {
        if (s.name && s.date_of_birth) {
          try {
            await AdminAPI.createStudent(s);
            success++;
          } catch {}
        }
      }
      await fetchStudents(selectedClass.id);
      Swal.fire("Hoàn tất", `Đã thêm ${success} học sinh`, "success");
    }
  };

  /* ---------------- RENDER ---------------- */
  if (selectedClass) {
    return (
      <div className="ml-64 p-4 mt-20">
        <button onClick={() => setSelectedClass(null)} className="mb-4 px-3 py-1 border rounded text-sm">
          ← Quay lại danh sách lớp
        </button>

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Học sinh lớp {selectedClass.name}</h2>
          <div className="flex gap-2">
            <button
              onClick={() => openModal("addStudent")}
              className="px-4 py-2 bg-green-600 text-white rounded font-bold"
            >
              ➕ Thêm học sinh
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-blue-500 text-white rounded font-bold"
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
          </div>
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
            {[...students]
              .sort(sortStudentsByName)
              .map((sv, i) => (
                <tr key={sv.id}>
                  <td className="p-2 border">{i + 1}</td>
                  <td className="p-2 border">{sv.name}</td>
                  <td className="p-2 border">
                    {sv.date_of_birth ? new Date(sv.date_of_birth).toLocaleDateString("vi-VN") : "—"}
                  </td>
                  <td className="p-2 border">{sv.gender || "—"}</td>
                  <td className="p-2 border text-center space-x-2">
                    <button onClick={() => openModal("editStudent", sv)}>✏️</button>
                    <button onClick={() => handleDeleteStudent(sv.id)}>🗑️</button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>

        {showModal && (
          <Modal
            type={modalType}
            teachers={teachers}
            nameValue={nameInput}
            setNameValue={setNameInput}
            teacherId={teacherId}
            setTeacherId={setTeacherId}
            dateValue={dateOfBirth}
            setDateValue={setDateOfBirth}
            gender={gender}
            setGender={setGender}
            onCancel={closeModal}
            onSave={handleModalSubmit}
          />
        )}
      </div>
    );
  }

  /* ----------- LIST OF CLASSES ----------- */
  return (
    <div className="ml-64 p-4 mt-20">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Danh sách lớp</h2>
        <button onClick={() => openModal("addClass")} className="px-4 py-2 bg-blue-600 text-white rounded">
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
              <td className="p-2 border">{cl.teacher_name || "—"}</td>
              <td className="p-2 border">{cl.student_count}</td>
              <td
                className="p-2 border text-center space-x-2"
                onClick={(e) => e.stopPropagation()}
              >
                <button onClick={() => openModal("editClass", { ...cl, teacher_id: cl.teacher_id || "" })}>✏️</button>
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
          nameValue={nameInput}
          setNameValue={setNameInput}
          teacherId={teacherId}
          setTeacherId={setTeacherId}
          dateValue={dateOfBirth}
          setDateValue={setDateOfBirth}
          gender={gender}
          setGender={setGender}
          onCancel={closeModal}
          onSave={handleModalSubmit}
        />
      )}
    </div>
  );
}

/* ---------------- MODAL COMPONENT ---------------- */
function Modal({
  type,
  teachers,
  nameValue,
  setNameValue,
  teacherId,
  setTeacherId,
  dateValue,
  setDateValue,
  gender,
  setGender,
  onCancel,
  onSave,
}) {
  const isClassForm = type === "addClass" || type === "editClass";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded shadow-md w-[360px]">
        <h3 className="text-lg font-semibold mb-4">
          {type.startsWith("add") ? "Thêm" : "Sửa"} {isClassForm ? "lớp" : "học sinh"}
        </h3>

        {/* NAME */}
        <label className="block text-sm mb-1">Tên {isClassForm ? "lớp" : "học sinh"}</label>
        <input
          value={nameValue}
          onChange={(e) => setNameValue(e.target.value)}
          className="w-full border px-3 py-2 mb-4"
        />

        {isClassForm ? (
          /* CLASS FORM */
          <>
            <label className="block text-sm mb-1">Giáo viên chủ nhiệm</label>
            <select
              value={teacherId?.toString()}
              onChange={(e) => setTeacherId(Number(e.target.value) || "")}
              className="w-full border px-3 py-2 mb-4"
            >
              <option value="">— Chưa chọn —</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </>
        ) : (
          /* STUDENT FORM */
          <>
            <label className="block text-sm mb-1">Ngày sinh</label>
            <input
              type="date"
              value={dateValue}
              onChange={(e) => setDateValue(e.target.value)}
              className="w-full border px-3 py-2 mb-4"
            />

            <label className="block text-sm mb-1">Giới tính</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full border px-3 py-2 mb-4"
            >
              <option value="">— Chưa chọn —</option>
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
            </select>
          </>
        )}

        <div className="flex justify-end gap-2">
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
