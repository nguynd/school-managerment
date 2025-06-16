// src/components/HomeroomDashboard.jsx
function HomeroomDashboard({ data }) {
  if (!data) return <p>Không chủ nhiệm lớp nào.</p>;

  return (
    <div className="rounded-lg border p-4 shadow-md bg-white">
      <h2 className="text-xl font-bold mb-2">
        Lớp chủ nhiệm: {data.class_name}
      </h2>
      <p>Sĩ số: {data.student_count}</p>
    </div>
  );
}

export default HomeroomDashboard;
