import { useEffect, useState } from "react";
import HomeroomAPI from "../services/HomeroomAPI";

function HomeroomDashboard({ data }) {
  const [students, setStudents] = useState([]);
  const [classAverage, setClassAverage] = useState(null);

  useEffect(() => {
    if (!data?.class_id) return;

    const fetchData = async () => {
      try {
        const [studentsRes, avgRes] = await Promise.all([
          HomeroomAPI.getStudentsInClass(data.class_id),
          HomeroomAPI.getClassAverageScore(data.class_id),
        ]);

        setStudents(studentsRes);
        setClassAverage(avgRes);
      } catch (err) {
        console.error("Lỗi khi lấy thông tin lớp chủ nhiệm", err);
      }
    };

    fetchData();
  }, [data?.class_id]);

  if (!data) return <p>Không chủ nhiệm lớp nào.</p>;

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      {/* Thông tin chung */}
      <h2 className="text-xl font-bold mb-2">
        Lớp chủ nhiệm: {data.class_name}
      </h2>
      <p>Sĩ số: {data.student_count}</p>
      <p>Điểm TB lớp: {classAverage?.avg?.toFixed(2) ?? "..."}</p>
      <p>Xếp loại: {classAverage?.classification ?? "..."}</p>

      {/* Danh sách học sinh */}
      <h3 className="mt-6 mb-2 text-lg font-semibold">Danh sách học sinh:</h3>
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">#</th>
            <th className="border p-2">Họ tên</th>
            <th className="border p-2">Ngày sinh</th>
            <th className="border p-2">ĐTB</th>
            <th className="border p-2">Xếp loại</th>
          </tr>
        </thead>
        <tbody>
          {students.map((s, idx) => (
            <tr key={s.id}>
              <td className="border p-2 text-center">{idx + 1}</td>
              <td className="border p-2">{s.name}</td>
              <td className="border p-2">{s.date_of_birth}</td>
              <td className="border p-2 text-center">{s.average?.toFixed(2) ?? "-"}</td>
              <td className="border p-2 text-center">{s.classification ?? "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default HomeroomDashboard;
