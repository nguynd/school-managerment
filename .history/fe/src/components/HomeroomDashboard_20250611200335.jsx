import { useEffect, useState } from "react";
import HomeroomAPI from "../services/HomeroomAPI";

function HomeroomDashboard({ data }) {
  const [students, setStudents] = useState([]);
  const [classAverage, setClassAverage] = useState(null);
  const [semester, setSemester] = useState("HK1");
  const [year, setYear] = useState(2024);

  useEffect(() => {
    if (!data?.class_id) return;

    const fetchData = async () => {
      try {
        const [studentsRes, avgRes] = await Promise.all([
          HomeroomAPI.getStudentsWithGrading(data.class_id, semester, year),
          HomeroomAPI.getClassAverageScore(data.class_id),
        ]);

        setStudents(studentsRes);
        setClassAverage(avgRes);
      } catch (err) {
        console.error("Lỗi khi lấy thông tin lớp chủ nhiệm", err);
      }
    };

    fetchData();
  }, [data?.class_id, semester, year]);

  if (!data) return <p>Không chủ nhiệm lớp nào.</p>;

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      {/* Bộ lọc học kỳ + năm học */}
      <div className="flex gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium">Học kỳ:</label>
          <select
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
            className="border px-2 py-1 rounded"
          >
            <option value="HK1">HK1</option>
            <option value="HK2">HK2</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium">Năm học:</label>
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
            className="border px-2 py-1 rounded w-24"
            min="2000"
            max="2100"
          />
        </div>
      </div>

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
