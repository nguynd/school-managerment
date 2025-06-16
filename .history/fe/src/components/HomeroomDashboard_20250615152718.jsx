import { useEffect, useState } from "react";
import { getHomeroomClass } from "../services/DashboardAPI";
import HomeroomAPI from "../services/HomeroomAPI";
import AdminAPI from "../services/AdminAPI";
import YearlyGradeAPI from "../services/YearlyGradeAPI";

function HomeroomDashboard() {
  const [students, setStudents] = useState([]);
  const [semester, setSemester] = useState("HK1");
  const [year, setYear] = useState(new Date().getFullYear());

  const fetchData = async () => {
    try {
      const homeroom = await getHomeroomClass();
      const classId = homeroom?.class_id;
      if (!classId) return;

      if (semester === "YEAR") {
        const rawStudents = await AdminAPI.getStudentsByClass(classId);
        const results = await Promise.all(
          rawStudents.map(async (s) => {
            try {
              const data = await YearlyGradeAPI.get(s.id, year);
              return {
                ...s,
                average: data.year_score,
                classification: data.year_grade,
              };
            } catch {
              return { ...s, average: "-", classification: "Chưa có dữ liệu" };
            }
          })
        );
        setStudents(results);
      } else {
        const list = await HomeroomAPI.getStudentsWithGrading(classId, semester, year);
        setStudents(list);
      }
    } catch (err) {
      console.error("Lỗi tải dữ liệu lớp:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [semester, year]);
  return (
    <div className="ml-64 mt-20 p-6">
      <h2 className="text-2xl font-bold mb-4">📘 Danh sách học sinh lớp chủ nhiệm</h2>

      <div className="flex items-center gap-4 mb-6">
        <select
          className="border p-2 rounded"
          value={semester}
          onChange={(e) => setSemester(e.target.value)}
        >
          <option value="HK1">Học kỳ 1</option>
          <option value="HK2">Học kỳ 2</option>
          <option value="YEAR">Tổng kết năm</option>
        </select>
        <select
          className="border p-2 rounded"
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
        >
          {Array.from({ length: 5 }, (_, i) => {
            const y = new Date().getFullYear() - i;
            return (
              <option key={y} value={y}>
                Năm {y}
              </option>
            );
          })}
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="px-4 py-2 border">STT</th>
              <th className="px-4 py-2 border">Họ tên</th>
              <th className="px-4 py-2 border">Ngày sinh</th>
              <th className="px-4 py-2 border">Giới tính</th>
              <th className="px-4 py-2 border text-center">Điểm TB</th>
              <th className="px-4 py-2 border text-center">Xếp loại</th>
            </tr>
          </thead>
          <tbody>
            {students.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center p-4 text-gray-500">
                  Không có dữ liệu.
                </td>
              </tr>
            ) : (
              students.map((s, idx) => (
                <tr key={s.id} className="border-t">
                  <td className="px-4 py-2 border">{idx + 1}</td>
                  <td className="px-4 py-2 border">{s.name}</td>
                  <td className="px-4 py-2 border">
                    {new Date(s.date_of_birth).toLocaleDateString("vi-VN")}
                  </td>
                  <td className="px-4 py-2 border">
                    {s.gender === "male" ? "Nam" : s.gender === "female" ? "Nữ" : s.gender}
                  </td>
                  <td className="px-4 py-2 border text-center">{s.average || "-"}</td>
                  <td className="px-4 py-2 border text-center">{s.classification || "-"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default HomeroomDashboard;