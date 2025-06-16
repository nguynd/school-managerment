import { useEffect, useState } from "react";
import { getMyScores } from "../services/StudentAPI";

export default function StudentDashboard() {
  const [scores, setScores] = useState([]);
  const [semester, setSemester] = useState("HK1");
  const [year, setYear] = useState("2024");

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await getMyScores(semester, year);
        setScores(data);
      } catch (err) {
        console.error("Lỗi khi lấy điểm:", err);
        setScores([]);
      }
    };
    fetch();
  }, [semester, year]);

  const filteredScores = scores.filter(
    (s) => s.semester === semester && String(s.year) === String(year)
  );

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-4">📘 Bảng điểm học sinh</h1>

      <div className="flex gap-4 mb-4">
        <select value={semester} onChange={(e) => setSemester(e.target.value)} className="border px-2 py-1 rounded">
          <option value="HK1">Học kỳ 1</option>
          <option value="HK2">Học kỳ 2</option>
        </select>
        <select value={year} onChange={(e) => setYear(e.target.value)} className="border px-2 py-1 rounded">
          <option value="2024">2024</option>
          <option value="2025">2025</option>
        </select>
      </div>

      <table className="min-w-full border-collapse border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-4 py-2">Môn học</th>
            <th className="border px-4 py-2">TX1</th>
            <th className="border px-4 py-2">TX2</th>
            <th className="border px-4 py-2">TX3</th>
            <th className="border px-4 py-2">GK</th>
            <th className="border px-4 py-2">CK</th>
          </tr>
        </thead>
        <tbody>
          {filteredScores.map((s) => (
            <tr key={s.id}>
              <td className="border px-4 py-2">{s.subject_name}</td>
              <td className="border px-4 py-2">{s.tx1 ?? "-"}</td>
              <td className="border px-4 py-2">{s.tx2 ?? "-"}</td>
              <td className="border px-4 py-2">{s.tx3 ?? "-"}</td>
              <td className="border px-4 py-2">{s.gk ?? "-"}</td>
              <td className="border px-4 py-2">{s.ck ?? "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {filteredScores.length === 0 && (
        <p className="text-gray-500 mt-4">
          Không có dữ liệu điểm trong học kỳ này.
        </p>
      )}
    </div>
  );
}
