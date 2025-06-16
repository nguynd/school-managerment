import { useEffect, useState } from "react";
import AdminAPI from "../../services/AdminAPI";
import Swal from "sweetalert2";
import { FiMoreVertical } from "react-icons/fi";

/* ---------- SORT & GROUP ---------- */
const ROLE_ORDER = { admin: 0, teacher: 1, student: 2, other: 3 };
const sortUsers = (a, b) => {
  const rA = ROLE_ORDER[a.role] ?? ROLE_ORDER.other;
  const rB = ROLE_ORDER[b.role] ?? ROLE_ORDER.other;
  if (rA !== rB) return rA - rB;
  return a.id - b.id;
};
const groupByRole = (list) => {
  const obj = {};
  list.forEach((u) => {
    const role = u.role || "other";
    if (!obj[role]) obj[role] = [];
    obj[role].push(u);
  });
  return Object.entries(obj)
    .sort(([ra], [rb]) => (ROLE_ORDER[ra] ?? 99) - (ROLE_ORDER[rb] ?? 99))
    .map(([role, arr]) => [role, arr.sort((a, b) => a.id - b.id)]);
};

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

  /* ---------- MODAL HELPERS ---------- */
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

  /* ---------- DELETE ---------- */
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Bạn có chắc chắn muốn xoá?",
      text: "User sẽ bị xoá vĩnh viễn!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "🗑️ Xoá",
      cancelButtonText: "Huỷ",
    });
    if (result.isConfirmed) {
      try {
        await AdminAPI.deleteUser(id);
        await fetchUsers();
        Swal.fire("Đã xoá!", "🗑️ User đã được xoá", "success");
      } catch {
        Swal.fire("Lỗi", "❌ Không thể xoá user", "error");
      }
    }
  };

  /* ---------- SUBMIT ---------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await AdminAPI.updateUser(editId, { name: form.name, role: form.role });
        Swal.fire("Thành công", "✅ Cập nhật user thành công", "success");
      } else {
        await AdminAPI.createUser(form);
        Swal.fire("Thành công", "✅ Tạo user thành công", "success");
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch {
      Swal.fire("Lỗi", "❌ Lỗi khi gửi dữ liệu", "error");
    }
  };

  /* ---------- RENDER ---------- */
  const grouped = groupByRole(users);
  let rowCounter = 0;

  return (
    <div className="ml-64 mt-20 p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Quản lý người dùng</h2>
        <button
          onClick={openAddModal}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          ➕ Thêm user
        </button>
      </div>

      {/* TABLE */}
      <table className="w-full border-collapse border text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">#</th>
            <th className="border p-2">Tên</th>
            <th className="border p-2">Email</th>
            <th className="border p-2">Vai trò</th>
            <th className="border p-2 w-16"></th>
          </tr>
        </thead>
        <tbody>
          {grouped.map(([role, list]) => (
            <tr key={`role-${role}`}>
              {/* Header nhóm */}
              <td colSpan={5} className="p-2 bg-blue-50 font-semibold">
                {role === "admin"
                  ? "Quản trị viên"
                  : role === "teacher"
                  ? "Giáo viên"
                  : role === "student"
                  ? "Học sinh"
                  : role}
              </td>
            </tr>,
            list.map((u) => {
              rowCounter++;
              return (
                <tr key={u.id}>
                  <td className="border p-2">{rowCounter}</td>
                  <td className="border p-2">{u.name}</td>
                  <td className="border p-2">{u.email}</td>
                  <td className="border p-2">
                    {u.role === "teacher"
                      ? "Giáo viên"
                      : u.role === "student"
                      ? "Học sinh"
                      : u.role === "admin"
                      ? "Quản trị viên"
                      : u.role}
                  </td>
                  <td className="border p-2 text-center">
                    <button
                      onClick={() => openEditModal(u)}
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
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-md w-[360px]">
            <h3 className="text-lg font-semibold mb-4">{editId ? "Sửa user" : "Thêm user"}</h3>
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
                  <option value="student">Học sinh</option>
                </select>
              </div>

              {/* ACTIONS */}
              <div className="flex justify-between items-center pt-2">
                {editId && (
                  <button
                    type="button"
                    onClick={() => handleDelete(editId)}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded font-bold"
                  >
                    🗑️ Xoá
                  </button>
                )}
                <div className="flex gap-2 ml-auto">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="border px-3 py-1 rounded"
                  >
                    Huỷ
                  </button>
                  <button type="submit" className="bg-blue-600 text-white px-4 py-1 rounded">
                    {editId ? "Cập nhật" : "Thêm"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default UsersTable;
