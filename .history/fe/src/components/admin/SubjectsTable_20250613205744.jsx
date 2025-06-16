import { useEffect, useState } from "react";
import { FiMoreVertical } from "react-icons/fi";
import Swal from "sweetalert2";
import SubjectAPI from "../services/SubjectAPI"; // cần tạo file này
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function SubjectsTable() {
  const [subjects, setSubjects] = useState([]);
  const [form, setForm] = useState({ name: "", regular_weight: "", mid_weight: "", final_weight: "" });
  const [editId, setEditId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchSubjects = async () => {
    const res = await SubjectAPI.getAll();
    setSubjects(res || []);
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const openAddModal = () => {
    setEditId(null);
    setForm({ name: "", regular_weight: "", mid_weight: "", final_weight: "" });
    setIsModalOpen(true);
  };

  const openEditModal = (s) => {
    setEditId(s.id);
    setForm({
      name: s.name,
      regular_weight: s.regular_weight,
      mid_weight: s.mid_weight,
      final_weight: s.final_weight,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Bạn có chắc?",
      text: "Thao tác này sẽ xoá môn học.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Xoá",
      cancelButtonText: "Huỷ",
    });

    if (confirm.isConfirmed) {
      await SubjectAPI.delete(id);
      toast.success("Đã xoá môn học");
      fetchSubjects();
    }
  };

  const handleSubmit = async () => {
    if (!form.name || !form.regular_weight || !form.mid_weight || !form.final_weight) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    try {
      if (editId) {
        await SubjectAPI.update(editId, form);
        toast.success("Cập nhật thành công");
      } else {
        await SubjectAPI.create(form);
        toast.success("Thêm môn học thành công");
      }
      fetchSubjects();
      setIsModalOpen(false);
    } catch (err) {
      toast.error("Có lỗi xảy ra");
    }
  };

  return (
    <div className="ml-64 mt-20 p-6">
      <ToastContainer />
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Danh sách môn học</h2>
        <button onClick={openAddModal} className="bg-blue-500 text-white px-3 py-1 rounded">Thêm</button>
      </div>
      <table className="w-full border text-left">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-3 py-2">#</th>
            <th className="px-3 py-2">Tên môn</th>
            <th className="px-3 py-2">Hệ số thường</th>
            <th className="px-3 py-2">Hệ số giữa kỳ</th>
            <th className="px-3 py-2">Hệ số cuối kỳ</th>
            <th className="px-3 py-2">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {subjects.map((s, idx) => (
            <tr key={s.id} className="border-b">
              <td className="px-3 py-2">{idx + 1}</td>
              <td className="px-3 py-2">{s.name}</td>
              <td className="px-3 py-2">{s.regular_weight}</td>
              <td className="px-3 py-2">{s.mid_weight}</td>
              <td className="px-3 py-2">{s.final_weight}</td>
              <td className="px-3 py-2">
                <button onClick={() => openEditModal(s)} className="mr-2 text-blue-600">Sửa</button>
                <button onClick={() => handleDelete(s.id)} className="text-red-600">Xoá</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow w-[400px]">
            <h3 className="text-lg font-semibold mb-4">{editId ? "Cập nhật môn học" : "Thêm môn học"}</h3>
            <input
              type="text"
              placeholder="Tên môn"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border px-3 py-1 mb-2"
            />
            <input
              type="number"
              placeholder="Hệ số thường"
              value={form.regular_weight}
              onChange={(e) => setForm({ ...form, regular_weight: e.target.value })}
              className="w-full border px-3 py-1 mb-2"
            />
            <input
              type="number"
              placeholder="Hệ số giữa kỳ"
              value={form.mid_weight}
              onChange={(e) => setForm({ ...form, mid_weight: e.target.value })}
              className="w-full border px-3 py-1 mb-2"
            />
            <input
              type="number"
              placeholder="Hệ số cuối kỳ"
              value={form.final_weight}
              onChange={(e) => setForm({ ...form, final_weight: e.target.value })}
              className="w-full border px-3 py-1 mb-2"
            />
            <div className="flex justify-end mt-4">
              <button onClick={() => setIsModalOpen(false)} className="mr-2">Huỷ</button>
              <button onClick={handleSubmit} className="bg-blue-500 text-white px-3 py-1 rounded">Lưu</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SubjectsTable;
