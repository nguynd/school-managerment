import { useEffect, useState } from "react";
import AdminAPI from "../../services/AdminAPI";

function ManageClassesAndStudents() {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [students, setStudents] = useState([]);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(""); // "addClass", "editClass", "addStudent", "editStudent"
  const [formValue, setFormValue] = useState("");
  const [editingItem, setEditingItem] = useState(null);

  // ─── FETCH DATA ───────────────────────────────────────────────
  const fetchClasses = async () => {
    const res = await AdminAPI.getAllClasses();
    setClasses(res || []);
  };

  const fetchStudents = async (classId) => {
    const res = await AdminAPI.getStudentsByClass(classId);
    setStudents(res || []);
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  // ─── MỞ MODAL ───────────────────────────────────────────────
  const openModal = (type, item = null) => {
    setModalType(type);
    setEditingItem(item);
    setFormValue(item?.name || "");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setFormValue("");
    setEditingItem(null);
  };

  const handleModalSubmit = async () => {
    if (!formValue.trim()) return;

    switch (modalType) {
      case "addClass":
        await AdminAPI.createClass({ name: formValue });
        await fetchClasses();
        break;
      case "editClass":
        await AdminAPI.updateClass(editingItem.id, { name: formValue });
        await fetchClasses();
        break;
      case "addStudent":
        await AdminAPI.createStudent({ name: formValue, class_id: selectedClass.id });
        await fetchStudents(selectedClass.id);
        break;
      case "editStudent":
        await AdminAPI.updateStudent(editingItem.id, { name: formValue });
        await fetchStudents(selectedClass.id);
        break;
      default:
        break;
    }

    closeModal();
  };

  // ─── DELETE ────────────────────────────────────────────────
  const handleDeleteClass = async (id) => {
    if (confirm("Bạn có chắc chắn muốn xoá lớp này?")) {
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

  // ─── GIAO DIỆN HỌC SINH ──────────────────────────────────────
  if (selectedClass) {
    return (
      <div className="ml-64 p-4 mt-20">
        <button
          onClick={() => setSelectedClass(null)}
          className="mb-4 px-3 py-1 border rounded text-sm"
        >
          ← Quay lại danh sách lớp
        </button>

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Học sinh lớp {selectedClass.name}</h2>
          <button
            onClick={() => openModal("addStudent")}
            className="px-4 py-2 bg-green-600 text-white rounded"
          >
            ➕ Thêm học sinh
          </button>
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
            {students.map((sv, i) => (
              <tr key={sv.id}>
                <td className="p-2 border">{i + 1}</td>
                <td className="p-2 border">{sv.name}</td>
                <td className="p-2 border">
                  {new Date(sv.date_of_birth).toLocaleDateString("vi-VN")}
                </td>
                <td className="p-2 border">{sv.gender}</td>
                <td className="p-2 border text-center space-x-2">
                  <button onClick={() => openModal("editStudent", sv)}>✏️</button>
                  <button onClick={() => handleDeleteStudent(sv.id)}>🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Modal */}
        {showModal && (
          <Modal
            title={modalType.includes("Class") ? "Lớp" : "Học sinh"}
            value={formValue}
            setValue={setFormValue}
            onCancel={closeModal}
            onSave={handleModalSubmit}
          />
        )}
      </div>
    );
  }

  // ─── GIAO DIỆN DANH SÁCH LỚP ─────────────────────────────────
  return (
    <div className="ml-64 p-4 mt-20">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Danh sách lớp</h2>
        <button
          onClick={() => openModal("addClass")}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
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
              <td className="p-2 border">{cl.teacher_name}</td>
              <td className="p-2 border">{cl.student_count}</td>
              <td
                className="p-2 border text-center space-x-2"
                onClick={(e) => e.stopPropagation()}
              >
                <button onClick={() => openModal("editClass", cl)}>✏️</button>
                <button onClick={() => handleDeleteClass(cl.id)}>🗑️</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal */}
      {showModal && (
        <Modal
          title={modalType.includes("Class") ? "Lớp" : "Học sinh"}
          value={formValue}
          setValue={setFormValue}
          onCancel={closeModal}
          onSave={handleModalSubmit}
        />
      )}
    </div>
  );
}

// ─── COMPONENT: Modal ──────────────────────────────────────────
function Modal({ title, value, setValue, onCancel, onSave }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded shadow-md w-[300px]">
        <h3 className="text-lg font-semibold mb-4">Nhập tên {title}</h3>
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-full border px-3 py-2 mb-4"
          placeholder={`Tên ${title.toLowerCase()}...`}
        />
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-3 py-1 border rounded"
          >
            Huỷ
          </button>
          <button
            onClick={onSave}
            className="px-3 py-1 bg-blue-600 text-white rounded"
          >
            Lưu
          </button>
        </div>
      </div>
    </div>
  );
}

export default ManageClassesAndStudents;
