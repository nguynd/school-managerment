// SubjectDashboard.jsx
import { useEffect, useState } from "react";
import {
  getSubjectClasses,
  getAllSubjectScores,
  updateScore,
} from "../services/DashboardAPI";
import AdminAPI from "../services/AdminAPI";
import { toast } from "react-toastify";

const SEMESTERS = ["HK1", "HK2"];
const YEARS = Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - i);

export default function SubjectDashboard() {
  const [classList, setClassList] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [semester, setSemester] = useState("HK1");
  const [year, setYear] = useState(new Date().getFullYear());

  const [scores, setScores] = useState([]);
  const [students, setStudents] = useState([]);

  useEffect(() => {
    getSubjectClasses().then(setClassList);
  }, []);

  useEffect(() => {
    if (!selectedClass) return;
    loadData();
  }, [selectedClass, semester, year]);

  const loadData = async () => {
    try {
      const [allScores, studentList] = await Promise.all([
        getAllSubjectScores(),
        AdminAPI.getStudentsByClass(selectedClass.class_id),
      ]);

      const filtered = allScores
        .filter(
          (s) =>
            s.class_id === selectedClass.class_id &&
            s.semester === semester &&
            s.year === year
        )
        .map((s) => ({
          ...s,
          average: calcAverage(s),
        }));

      setScores(filtered);
      setStudents(studentList);
    } catch (err) {
      toast.error("Lỗi khi tải dữ liệu.");
    }
  };

  const calcAverage = (row) => {
    const { tx1, tx2, tx3, gk, ck, regular_weight, mid_weight, final_weight } =
      row;
    const rW = regular_weight || 1,
      mW = mid_weight || 1,
      fW = final_weight || 1;
    const total =
      ((tx1 ?? 0) + (tx2 ?? 0) + (tx3 ?? 0)) * rW +
      (gk ?? 0) * mW +
      (ck ?? 0) * fW;
    const denom = 3 * rW + mW + fW;
    return denom ? +(total / denom).toFixed(2) : null;
  };

  const handleScoreChange = (index, field, value) => {
    const newScores = [...scores];
    newScores[index][field] = value === "" ? null : Number(value);
    newScores[index].average = calcAverage(newScores[index]);
    setScores(newScores);
  };

  const handleBlur = async (row) => {
    try {
      await updateScore(row.score_id, {
        tx1: row.tx1,
        tx2: row.tx2,
        tx3: row.tx3,
        gk: row.gk,
        ck: row.ck,
      });
      toast.success("Đã lưu điểm");
    } catch {
      toast.error("Lưu điểm thất bại");
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Điểm môn học</h2>

      {/* Danh sách lớp */}
      {/* Giao diện chọn lớp kiểu "card" */}
<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
  {classList.map((cls) => {
    const isSelected = selectedClass?.class_id === cls.class_id;

    return (
      <div
        key={cls.class_id}
        onClick={() => setSelectedClass(cls)}
        className={`cursor-pointer border rounded-2xl p-4 transition-all duration-200
          ${
            isSelected
              ? "bg-white border-blue-500"
              : "bg-white border-blue-500 hover:bg-blue-100"
          }`}
      >
        <p className="font-semibold text-lg text-black">
          {cls.class_name} - {cls.subject_name}
        </p>
        <p className="text-sm text-gray-700">Sĩ số: {cls.student_count}</p>
      </div>
    );
  })}
</div>


      {/* Bộ lọc */}
      {selectedClass && (
        <div className="flex gap-4 mb-4">
          <select
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
            className="border px-2 py-1 rounded"
          >
            {SEMESTERS.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>

          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="border px-2 py-1 rounded"
          >
            {YEARS.map((y) => (
              <option key={y}>{y}</option>
            ))}
          </select>
        </div>
      )}

      {/* Bảng điểm */}
      {selectedClass && (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300 text-sm">
            <thead className="bg-gray-100">
              <tr>
                {[
                  "Tên",
                  "Ngày sinh",
                  "Giới tính",
                  "TX1",
                  "TX2",
                  "TX3",
                  "GK",
                  "CK",
                  "TB",
                ].map((h) => (
                  <th key={h} className="border px-2 py-1">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {scores.map((s, idx) => {
                const student = students.find((st) => st.id === s.student_id);
                return (
                  <tr key={s.score_id} className="odd:bg-white even:bg-gray-50">
                    <td className="border px-2 py-1">{student?.name}</td>
                    <td className="border px-2 py-1">{student?.date_of_birth}</td>
                    <td className="border px-2 py-1">{student?.gender}</td>
                    {["tx1", "tx2", "tx3", "gk", "ck"].map((f) => (
                      <td key={f} className="border px-1 py-1">
                        <input
                          type="number"
                          value={s[f] ?? ""}
                          min={0}
                          max={10}
                          step={0.25}
                          className="w-14 border rounded px-1"
                          onChange={(e) =>
                            handleScoreChange(idx, f, e.target.value)
                          }
                          onBlur={() => handleBlur(s)}
                        />
                      </td>
                    ))}
                    <td className="border text-center">{s.average ?? "-"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
