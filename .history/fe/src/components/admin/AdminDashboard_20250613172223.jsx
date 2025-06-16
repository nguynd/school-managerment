import ManageClassesAndStudents from './ManageClassesAndStudents';

function AdminDashboard() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="mt-2 text-gray-600">Tổng quan hệ thống quản lý điểm</p>
      </div>

      {/* ✅ Giao diện quản lý lớp và học sinh */}
      <ManageClassesAndStudents />
    </div>
  );
}

export default AdminDashboard;
