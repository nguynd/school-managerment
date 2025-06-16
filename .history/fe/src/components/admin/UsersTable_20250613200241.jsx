import { useEffect, useState } from "react";
import AdminAPI from "../../services/AdminAPI";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function UsersTable() {
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", role: "", password: "" });
  const [editId, setEditId] = useState(null);

  const fetchUsers = async () => {
    const res = await AdminAPI.getAllUsers();
    setUsers(res || []);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openAddModal = () => {
    setEditId(null);
    setForm({ name: "", email: "", role: "", password: "" });
    setIsModalOpen(true);
  };

  const openEditModal = (user) => {
    setEditId(user.id);
    setForm({ name: user.name, email: user.email, role: user.role, password: "" });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (confirm("Bạn có chắc chắn muốn xoá user này?")) {
      await AdminAPI.deleteUser(id);
      toast.success("🗑️ Đã xoá user");
      fetchUsers();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await AdminAPI.updateUser(editId, {
          name: form.name,
          role: form.role,
        });
        toast.success("✅ Cập nhật user thành công");
      } else {
        await AdminAPI.createUser(form);
        toast.success("✅ Tạo user thành công");
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch {
      toast.error("❌ Lỗi khi gửi dữ liệu");
    }
  };

  return (
    <div className="ml-64 mt-20 p-6">
      <ToastContainer />
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Quản lý người dùng</h2>
        <button
          onClick={openAddModal}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          ➕ Thêm user
        </button>
      </div>

      <table className="w-full border-collapse border text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">#</th>
            <th className="border p-2">Tên</th>
            <th className="border p-2">Email</th>
            <th className="border p-2">Vai trò</th>
            <th className="border p-2 w-32">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u, i) => (
            <tr key={u.id}>
              <td className="border p-2">{i + 1}</td>
              <td className="border p-2">{u.name}</td>
              <td className="border p-2">{u.email}</td>
              <td className="border p-2">{u.role}</td>
              <td className="border p-2 text-center space-x-2">
                <button onClick={() => openEditModal(u)}>✏️</button>
                <button onClick={() => handleDelete(u.id)}>🗑️</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-md w-[360px]">
            <h3 className="text-lg font-semibold mb-4">
              {editId ? "Sửa user" : "Thêm user"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-3 text-sm">
              <div>
                <label className="block">Tên</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full border px-3 py-2"
                  required={!editId}
                  disabled={!!editId}
                />
              </div>
              {!editId && (
                <div>
                  <label className="block">Mật khẩu</label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full border px-3 py-2"
                    required
                  />
                </div>
              )}
              <div>
                <label className="block">Vai trò</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full border px-3 py-2"
                  required
                >
                  <option value="">-- Chọn vai trò --</option>
                  <option value="admin">Admin</option>
                  <option value="teacher">Giáo viên</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="border px-3 py-1 rounded">
                  Huỷ
                </button>
                <button type="submit" className="bg-blue-600 text-white px-4 py-1 rounded">
                  {editId ? "Cập nhật" : "Thêm"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default UsersTable;
