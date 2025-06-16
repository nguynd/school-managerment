import { useEffect, useRef, useState } from "react";
import AdminAPI from "../../services/AdminAPI";
import * as XLSX from "xlsx";
import Swal from "sweetalert2";
import { FiMoreVertical } from "react-icons/fi";

/* ---------- PARSE & SORT CLASS NAMES ---------- */
const sortClassesByName = (a, b) => {
  const parse = (name) => {
    // 10A1  → ["10", "A", "1"]
    const match = name.match(/^(\d+)([A-Z]+)(\d+)$/i);
    if (!match) return [999, "Z", 999];           // đẩy format lạ xuống cuối
    const [, grade, letter, number] = match;
    return [parseInt(grade), letter.toUpperCase(), parseInt(number)];
  };

  const [gA, lA, nA] = parse(a.name);
  const [gB, lB, nB] = parse(b.name);

  if (gA !== gB) return gA - gB;
  if (lA !== lB) return lA.localeCompare(lB);
  return nA - nB;
};
const [email, setEmail] = useState("");

/* ---------- GROUP BY GRADE ---------- */
const groupClassesByGrade = (classes) => {
  const obj = {};
  classes.forEach((cl) => {
    const m = cl.name.match(/^(\d+)/);
    const grade = m ? m[1] : "Khác";
    if (!obj[grade]) obj[grade] = [];
    obj[grade].push(cl);
  });

  // sắp xếp từng nhóm và toàn bộ nhóm
  const entries = Object.entries(obj)
    .map(([grade, arr]) => [grade, arr.sort(sortClassesByName)])
    .sort((a, b) => parseInt(a[0]) - parseInt(b[0]));

  return entries; // [ [ '10', [cl, cl] ], [ '11', [...] ], ... ]
};

function ManageClassesAndStudents() {
  /* ---------- STATE ---------- */
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [students, setStudents] = useState([]);

  // modal
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");       // addClass | editClass | addStudent | editStudent
  const [nameInput, setNameInput] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [editingItem, setEditingItem] = useState(null);

  const fileInputRef = useRef();

  /* ---------- FETCH ---------- */
  const fetchClasses = async () => setClasses(await AdminAPI.getAllClasses() || []);
  const fetchTeachers = async () => setTeachers(await AdminAPI.getAllTeachers() || []);
  const fetchStudents = async (classId) => setStudents(await AdminAPI.getStudentsByClass(classId) || []);

  useEffect(() => {
    fetchClasses();
    fetchTeachers();
  }, []);

  /* ---------- SORT VN NAME ---------- */
  const sortStudentsByName = (a, b) => {
    const sA = a.name.trim().split(" ");
    const sB = b.name.trim().split(" ");
    const last = sA.at(-1).localeCompare(sB.at(-1), "vi");
    if (last) return last;

    const midA = sA.slice(1, -1);
    const midB = sB.slice(1, -1);
    const len = Math.max(midA.length, midB.length);
    for (let i = 1; i <= len; i++) {
      const c = (midA[midA.length - i] || "").localeCompare(midB[midB.length - i] || "", "vi");
      if (c) return c;
    }
    const first = sA[0].localeCompare(sB[0], "vi");
    return first || a.id - b.id;
  };

  /* ---------- MODAL HELPERS ---------- */
  const openModal = (type, item = null) => {
    setModalType(type);
    setEditingItem(item);
    setNameInput(item?.name || "");
    setTeacherId(item?.teacher_id || "");
    setDateOfBirth(item?.date_of_birth?.slice(0, 10) || "");
    setGender(item?.gender || "");
    setShowModal(true);
    setEmail(item?.email || "");
  };
  const closeModal = () => {
    setShowModal(false);
    setNameInput("");
    setTeacherId("");
    setDateOfBirth("");
    setGender("");
    setEditingItem(null);
    setEmail("");
  };

  /* ---------- SUBMIT CREATE/UPDATE ---------- */
 const handleModalSubmit = async () => {
  // 1️⃣ Kiểm tra tên không rỗng
  if (!nameInput.trim()) return;

  try {
    /* ------------------ 2️⃣ XỬ LÝ EMAIL (chỉ áp dụng cho học sinh) ------------------ */
    let foundUserId = null;

    if (
      (modalType === "addStudent" || modalType === "editStudent") &&
      email.trim()
    ) {
      const users = await AdminAPI.getAllUsers();          // lấy toàn bộ users
      const found = users.find(
        (u) => u.email.toLowerCase() === email.trim().toLowerCase()
      );

      if (!found) {
        await Swal.fire(
          "❌ Lỗi",
          `Không tìm thấy tài khoản với email: ${email}`,
          "error"
        );
        return; // dừng lại nếu email không hợp lệ
      }
      foundUserId = found.id; // lưu user_id để insert/update
    }

    /* ------------------ 3️⃣ GỌI API TƯƠNG ỨNG ------------------ */
    switch (modalType) {
      /* ----- LỚP ----- */
      case "addClass":
        await AdminAPI.createClass({
          name: nameInput.trim(),
          teacher_id: teacherId || null,
        });
        await fetchClasses();
        await Swal.fire("✅ Thành công", "Đã thêm lớp học", "success");
        break;

      case "editClass":
        await AdminAPI.updateClass(editingItem.id, {
          name: nameInput.trim(),
          teacher_id: teacherId || null,
        });
        await fetchClasses();
        await Swal.fire("✅ Thành công", "Đã cập nhật lớp học", "success");
        break;

      /* ----- HỌC SINH ----- */
      case "addStudent":
        await AdminAPI.createStudent({
          name: nameInput.trim(),
          date_of_birth: dateOfBirth,
          gender,
          class_id: selectedClass.id,
          user_id: foundUserId,               // có thể null
        });
        await fetchStudents(selectedClass.id);
        await Swal.fire("✅ Thành công", "Đã thêm học sinh", "success");
        break;

      case "editStudent":
        await AdminAPI.updateStudent(editingItem.id, {
          name: nameInput.trim(),
          date_of_birth: dateOfBirth,
          gender,
          class_id: selectedClass.id,
          user_id: foundUserId,               // có thể null
        });
        await fetchStudents(selectedClass.id);
        await Swal.fire("✅ Thành công", "Đã cập nhật học sinh", "success");
        break;

      default:
        break;
    }
  } catch (err) {
    console.error("❌ Lỗi submit:", err);
    Swal.fire("❌ Lỗi", "Đã có lỗi xảy ra", "error");
  }

  /* ------------------ 4️⃣ ĐÓNG MODAL ------------------ */
  closeModal();
};


  /* ---------- DELETE ---------- */
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

  /* ---------- EXCEL IMPORT ---------- */
  const handleExcelImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async ({ target }) => {
      try {
        const wb = XLSX.read(target.result, { type: "binary" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(ws, { defval: "" });

        const list = rows.map((r) => {
          let date_of_birth = "";
          const raw = r["Ngày sinh"];
          if (typeof raw === "number") {
            const d = XLSX.SSF.parse_date_code(raw);
            if (d) date_of_birth = `${d.y}-${String(d.m).padStart(2, "0")}-${String(d.d).padStart(2, "0")}`;
          } else if (typeof raw === "string") {
            const [d, m, y] = raw.split("/");
            const parsed = d && m && y && d.length === 2 ? new Date(`${m}/${d}/${y}`) : new Date(raw);
            if (!isNaN(parsed)) date_of_birth = parsed.toISOString().split("T")[0];
          }
          return {
            name: r["Họ tên"]?.toString().trim() || "",
            date_of_birth,
            gender: r["Giới tính"]?.toString().trim() || "",
            class_id: selectedClass?.id,
          };
        });

        showPreviewPopup(list);
      } catch {
        Swal.fire("❌ Lỗi", "Không thể đọc file Excel", "error");
      } finally {
        e.target.value = null;
      }
    };
    reader.readAsBinaryString(file);
  };

  /* ---------- PREVIEW & BULK INSERT ---------- */
  const showPreviewPopup = async (students) => {
    const hasErr = students.some((s) => !s.name || !s.date_of_birth);
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
      title: hasErr ? "⚠️ Có lỗi, không thể thêm" : `Thêm ${students.length} học sinh?`,
      html,
      showCancelButton: true,
      showConfirmButton: !hasErr,
      confirmButtonText: "✅ Thêm tất cả",
      cancelButtonText: hasErr ? "Đóng" : "❌ Huỷ",
      width: "800px",
    });

    if (isConfirmed) {
      let ok = 0;
      for (const s of students)
        if (s.name && s.date_of_birth)
          try {
            await AdminAPI.createStudent(s);
            ok++;
          } catch {}
      await fetchStudents(selectedClass.id);
      Swal.fire("Hoàn tất", `Đã thêm ${ok} học sinh`, "success");
    }
  };

  /* ====================== RENDER ====================== */
  /* ----- VIEW STUDENTS ----- */
  if (selectedClass) {
    return (
      <div className="ml-64 p-4 mt-2">
        <button onClick={() => setSelectedClass(null)} className="mb-4 px-3 py-1 border rounded text-sm">
          ← Quay lại danh sách lớp
        </button>

        {/* HEADER */}
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

        {/* TABLE STUDENTS */}
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">#</th>
              <th className="p-2 border">Họ tên</th>
              <th className="p-2 border">Ngày sinh</th>
              <th className="p-2 border">Giới tính</th>
               <th className="p-2 border">Email</th>
              <th className="p-2 border w-16"></th>
            </tr>
          </thead>
          <tbody>
                {[...students].sort(sortStudentsByName).map((sv, i) => (
                  <tr key={sv.id}>
                    <td className="p-2 border">{i + 1}</td>
                    <td className="p-2 border">{sv.name}</td>
                    <td className="p-2 border">
                      {sv.date_of_birth ? new Date(sv.date_of_birth).toLocaleDateString("vi-VN") : "—"}
                    </td>
                    <td className="p-2 border">{sv.gender || "—"}</td>
                    <td className="p-2 border">{sv.email || "—"}</td>
                    <td className="p-2 border text-center">
                      <button
                        onClick={() => openModal("editStudent", sv)}
                        className="hover:bg-gray-100 p-2 rounded-full"
                      >
                        <FiMoreVertical className="w-5 h-5 text-gray-600 hover:text-black" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>

        </table>

        {/* MODAL */}
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
            onDelete={modalType === "editStudent" ? () => handleDeleteStudent(editingItem.id) : null}
          />
        )}
      </div>
    );
  }

  /* ----- LIST OF CLASSES (with grouping) ----- */
  const grouped = groupClassesByGrade(classes);
  let rowCounter = 0;

  return (
    <div className="ml-64 p-4 ">
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
            <th className="p-2 border w-16"></th>
          </tr>
        </thead>
        <tbody>
          {grouped.map(([grade, cls]) => (
            <tr key={`grade-${grade}`}>
              <td colSpan={5} className="p-2 bg-blue-50 font-semibold">
                Khối {grade}
              </td>
            </tr>,
            cls.map((cl) => {
              rowCounter++;
              return (
                <tr
                  key={cl.id}
                  onClick={() => {
                    setSelectedClass(cl);
                    fetchStudents(cl.id);
                  }}
                  className="hover:bg-gray-50 cursor-pointer"
                >
                  <td className="p-2 border">{rowCounter}</td>
                  <td className="p-2 border">{cl.name}</td>
                  <td className="p-2 border">{cl.teacher_name || "—"}</td>
                  <td className="p-2 border">{cl.student_count}</td>
                  <td
                    className="p-2 border text-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => openModal("editClass", { ...cl, teacher_id: cl.teacher_id || "" })}
                      className="hover:bg-gray-100 p-2 rounded-full"
                    >
                      <FiMoreVertical className="w-5 h-5 text-gray-600 hover:text-black" />
                    </button>
                  </td>
                </tr>
              );
            })
          ))}
        </tbody>
      </table>

      {/* MODAL */}
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
          onDelete={modalType === "editClass" ? () => handleDeleteClass(editingItem.id) : null}
        />
      )}
    </div>
  );
}

/* ---------- MODAL COMPONENT ---------- */
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
  onDelete,
}) {
  const isClassForm = type === "addClass" || type === "editClass";
  const isEdit = type.startsWith("edit");

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded shadow-md w-[360px]">
        <h3 className="text-lg font-semibold mb-4">
          {type.startsWith("add") ? "Thêm" : "Sửa"} {isClassForm ? "lớp" : "học sinh"}
        </h3>

        {/* TÊN */}
        <label className="block text-sm mb-1">Tên {isClassForm ? "lớp" : "học sinh"}</label>
        <input
          value={nameValue}
          onChange={(e) => setNameValue(e.target.value)}
          className="w-full border px-3 py-2 mb-4"
        />

        {/* FORM CHI TIẾT */}
        {isClassForm ? (
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

            <label className="block text-sm mb-1">Email học sinh</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border px-3 py-2 mb-4"
            />
          </>

        )}

        {/* ACTIONS */}
        <div className="flex justify-between items-center pt-2">
          {isEdit && onDelete && (
            <button
              onClick={onDelete}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded font-bold"
            >
              🗑️ Xoá
            </button>
          )}
          <div className="flex gap-2 ml-auto">
            <button onClick={onCancel} className="px-4 py-2 border rounded">
              Huỷ
            </button>
            <button onClick={onSave} className="px-4 py-2 bg-blue-600 text-white rounded">
              Lưu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ManageClassesAndStudents;
