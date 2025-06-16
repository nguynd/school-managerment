import { useEffect, useState } from "react";
import { getHomeroomClass } from "../services/DashboardAPI";
import HomeroomAPI from "../services/HomeroomAPI";
import AdminAPI from "../services/AdminAPI";
import YearlyGradeAPI from "../services/YearlyGradeAPI";

function HomeroomDashboard() {
  const [students, setStudents] = useState([]);
  const [semester, setSemester] = useState("HK1");
  const [year, setYear] = useState(new Date().getFullYear());

  // 🔤 Hàm so sánh tên tiếng Việt chuẩn
const extractNameParts = (fullName) => {
  const parts = fullName.trim().split(/\s+/);
  const last = parts[parts.length - 1];
  const middle = parts.slice(1, -1).join(" ");
  const first = parts[0];
  return { first, middle, last };
};

const compareNames = (a, b) => {
  const nameA = extractNameParts(a.name);
  const nameB = extractNameParts(b.name);

  const lastCompare = nameA.last.localeCompare(nameB.last, "vi", { sensitivity: "base" });
  if (lastCompare !== 0) return lastCompare;

  const middleCompare = nameA.middle.localeCompare(nameB.middle, "vi", { sensitivity: "base" });
  if (middleCompare !== 0) return middleCompare;

  const firstCompare = nameA.first.localeCompare(nameB.first, "vi", { sensitivity: "base" });
  if (firstCompare !== 0) return firstCompare;

  return a.id - b.id;
};

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
              let res;
              try {
                res = await YearlyGradeAPI.get(s.id, year);
              } catch (err) {
                if (err.response?.status === 404) {
                  res = await YearlyGradeAPI.calculate(s.id, year);
                } else throw err;
              }

              const data = res.data;
              const yearScore =
                data?.year_score !== null &&
                data?.year_score !== undefined &&
                !isNaN(Number(data.year_score))
                  ? Number(data.year_score).toFixed(2)
                  : "-";

              const yearGrade =
                data?.year_grade && typeof data.year_grade === "string"
                  ? data.year_grade
                  : "-";

              return {
                ...s,
                average: yearScore,
                classification: yearGrade,
              };
            } catch {
              return { ...s, average: "-", classification: "Chưa có dữ liệu" };
            }
          })
        );

        // 🔤 Sắp xếp theo tên
        results.sort(compareNames);
        setStudents(results);
      } else {
        const list = await HomeroomAPI.getStudentsWithGrading(classId, semester, year);
        const mapped = list.map((s) => ({
          ...s,
          average:
            s.average !== null && s.average !== undefined && !isNaN(Number(s.average))
              ? Number(s.average).toFixed(2)
              : "-",
          classification: s.classification || "-",
        }));

        // 🔤 Sắp xếp theo tên
        mapped.sort(compareNames);
        setStudents(mapped);
      }
    } catch (err) {
      console.error("Lỗi khi tải dữ liệu lớp:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [semester, year]);

  return (
    <div className=" p-6">
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
                    {s.gender === "male"
                      ? "Nam"
                      : s.gender === "female"
                      ? "Nữ"
                      : s.gender}
                  </td>
                  <td className="px-4 py-2 border text-center">{s.average}</td>
                  <td className="px-4 py-2 border text-center">{s.classification}</td>
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
