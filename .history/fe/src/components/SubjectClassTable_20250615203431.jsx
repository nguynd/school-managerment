import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import {
  getAllSubjectScores,
  updateScore,
  getSubjectById,
} from "../services/DashboardAPI";
import AdminAPI from "../services/AdminAPI";
import { toast } from "react-toastify";

const SEMESTERS = ["HK1", "HK2"];
const YEARS = Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - i);

export default function SubjectClassTable() {
  /* lấy classId từ /subject/class/:id */
  const { id: classId } = useParams();
  /* lấy subjectId từ query: ?subject=...  */
  const [searchParams] = useSearchParams();
  const subjectId = searchParams.get("subject");

  const navigate = useNavigate();

  /* state */
  const [semester, setSemester] = useState("HK1");
  const [year, setYear] = useState(new Date().getFullYear());
  const [scores, setScores] = useState([]);
  const [students, setStudents] = useState([]);
  const [subjectWeights, setSubjectWeights] = useState({
    regular_weight: 1,
    mid_weight: 1,
    final_weight: 1,
  });

  /* tải dữ liệu mỗi khi classId / subjectId / semester / year đổi */
useEffect(() => {
  if (!classId || !subjectId) return;
  loadData();
}, [classId, subjectId, semester, year]); // ✅ đã thêm subjectId


  /* ---------------- helper ---------------- */
  const calcAverage = (row) => {
    const { tx1, tx2, tx3, gk, ck } = row;
    const { regular_weight: rW, mid_weight: mW, final_weight: fW } =
      subjectWeights;

    const total =
      ((tx1 ?? 0) + (tx2 ?? 0) + (tx3 ?? 0)) * rW +
      (gk ?? 0) * mW +
      (ck ?? 0) * fW;

    const denom = 3 * rW + mW + fW;
    return denom ? +(total / denom).toFixed(2) : null;
  };

  /* ---------------- load ---------------- */
  const loadData = async () => {
    try {
      const [allScores, studentList, subject] = await Promise.all([
        getAllSubjectScores(),
        AdminAPI.getStudentsByClass(classId),
        getSubjectById(subjectId),
      ]);

      /* cập nhật trọng số */
      setSubjectWeights({
        regular_weight: subject.regular_weight ?? 1,
        mid_weight: subject.mid_weight ?? 1,
        final_weight: subject.final_weight ?? 1,
      });

      /* lọc đúng lớp & môn & kỳ & năm */
      const classScores = allScores.filter(
        (s) =>
          String(s.class_id) === String(classId) &&
          String(s.subject_id) === String(subjectId) &&
          s.semester === semester &&
          s.year === year
      );

      setScores(
        classScores.map((s) => ({
          ...s,
          average: calcAverage(s),
        }))
      );
      setStudents(studentList);
    } catch (err) {
      console.error(err);
      toast.error("Không tải được dữ liệu lớp.");
    }
  };

  /* ---------------- sự kiện ---------------- */
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

  /* ---------------- render ---------------- */
  if (!classId || !subjectId) {
    return (
      <div className="p-4">
        <p className="text-red-600">
          Thiếu classId hoặc subjectId – hãy quay lại trang trước.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <button onClick={() => navigate(-1)} className="mb-4 text-blue-600 underline">
        ← Trở lại
      </button>

      <h2 className="text-xl font-semibold mb-2">Bảng điểm lớp</h2>
      <p className="text-sm text-gray-600 mb-4">
        Trọng số: TX&nbsp;x{subjectWeights.regular_weight}, GK&nbsp;x
        {subjectWeights.mid_weight}, CK&nbsp;x{subjectWeights.final_weight}
      </p>

      {/* Bộ lọc */}
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

      {/* Bảng điểm */}
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300 text-sm">
          <thead className="bg-gray-100">
            <tr>
              {["Tên", "Ngày sinh", "Giới tính", "TX1", "TX2", "TX3", "GK", "CK", "TB"].map(
                (h) => (
                  <th key={h} className="border px-2 py-1">
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {scores.map((s, idx) => {
              const st = students.find((u) => u.id === s.student_id);
              return (
                <tr key={s.score_id} className="odd:bg-white even:bg-gray-50">
                  <td className="border px-2 py-1">{st?.name}</td>
                  <td className="border px-2 py-1">{st?.date_of_birth}</td>
                  <td className="border px-2 py-1">{st?.gender}</td>

                  {["tx1", "tx2", "tx3", "gk", "ck"].map((f) => (
                    <td key={f} className="border px-1 py-1">
                      <input
                        type="number"
                        value={s[f] ?? ""}
                        min={0}
                        max={10}
                        step={0.25}
                        className="w-14 border rounded px-1"
                        onChange={(e) => handleScoreChange(idx, f, e.target.value)}
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
    </div>
  );
}
