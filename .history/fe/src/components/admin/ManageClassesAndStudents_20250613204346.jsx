import { useEffect, useRef, useState } from "react";
import AdminAPI from "../../services/AdminAPI";
import * as XLSX from "xlsx";
import Swal from "sweetalert2";
import { FiMoreVertical } from "react-icons/fi";

function ManageClassesAndStudents() {
  /* ---------- STATE ---------- */
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [students, setStudents] = useState([]);

  // modal
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");              // addClass | editClass | addStudent | editStudent
  const [nameInput, setNameInput] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [editingItem, setEditingItem] = useState(null);

  const fileInputRef = useRef();

  /* ---------- FETCH ---------- */
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

  /* ---------- SORT VN NAME ---------- */
  const sortStudentsByName = (a, b) => {
    const splitA = a.name.trim().split(" ");
    const splitB = b.name.trim().split(" ");
    const cmpLast = splitA.at(-1).localeCompare(splitB.at(-1), "vi");
    if (cmpLast !== 0) return cmpLast;

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

  /* ---------- MODAL HELPERS ---------- */
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

  /* ---------- SUBMIT (CREATE / UPDATE) ---------- */
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

  /* ---------- DELETE (NOW ONLY INSIDE MODAL) ---------- */
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

  /* ---------- EXCEL IMPORT (giữ nguyên) ---------- */
  const handleExcelImport = (e) => { /* ... như cũ, không đổi ... */ };

  /* ---------- RENDER ---------- */
  /* ----- 1. VIEW STUDENTS OF A CLASS ----- */
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
              <th className="p-2 border w-20"></th>
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
                  {/* TUỲ CHỌN */}
                  <td className="p-2 border text-center">
                    <button
                      onClick={() => openModal("editStudent", sv)}
                      className="hover:bg-gray-100 p-2 rounded-full"
                      title="Tuỳ chọn"
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
            onDelete={
              modalType === "editStudent" ? () => handleDeleteStudent(editingItem.id) : null
            }
          />
        )}
      </div>
    );
  }

  /* ----- 2. LIST OF CLASSES ----- */
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
            <th className="p-2 border w-20"></th>
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
              {/* TUỲ CHỌN */}
              <td
                className="p-2 border text-center"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => openModal("editClass", { ...cl, teacher_id: cl.teacher_id || "" })}
                  className="hover:bg-gray-100 p-2 rounded-full"
                  title="Tuỳ chọn"
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
          onDelete={
            modalType === "editClass" ? () => handleDeleteClass(editingItem.id) : null
          }
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
  onDelete,      // ⬅️ mới
}) {
  const isClassForm = type === "addClass" || type === "editClass";
  const isEdit = type.startsWith("edit");

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded shadow-md w-[360px]">
        <h3 className="text-lg font-semibold mb-4">
          {type.startsWith("add") ? "Thêm" : "Sửa"} {isClassForm ? "lớp" : "học sinh"}
        </h3>

        {/* INPUT TÊN */}
        <label className="block text-sm mb-1">Tên {isClassForm ? "lớp" : "học sinh"}</label>
        <input
          value={nameValue}
          onChange={(e) => setNameValue(e.target.value)}
          className="w-full border px-3 py-2 mb-4"
        />

        {/* FORM CHI TIẾT */}
        {isClassForm ? (
          /* ----- CLASS FORM ----- */
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
          /* ----- STUDENT FORM ----- */
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

        {/* ACTION BUTTONS */}
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
