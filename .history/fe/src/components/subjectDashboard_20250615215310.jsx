import { useEffect, useState } from "react";
import {
  getAllSubjectScores,
  addScore,
  updateScore,
} from "../services/DashboardAPI";

/** Lớp + môn được truyền từ props.data (từ Dashboard cha) */
export default function SubjectDashboard({ data }) {
  const [selectedClass, setSelectedClass] = useState(null);

  const [allScores, setAllScores] = useState([]);
  const [filteredScores, setFilteredScores] = useState([]);
  const [classAverage, setClassAverage] = useState(null);

  const [semesterFilter, setSemesterFilter] = useState("HK1");
  const [yearFilter, setYearFilter] = useState("2024");

  // ✅ Gọi lại API mỗi khi học kỳ hoặc năm thay đổi
  useEffect(() => {
    const fetchScores = async () => {
      try {
        const res = await getAllSubjectScores();
        setAllScores(res || []);

        // ✅ Kích hoạt lại selectedClass để re-render
        if (selectedClass) {
          setSelectedClass({ ...selectedClass });
        }
      } catch (err) {
        console.error("❌ Lỗi getAllSubjectScores:", err);
      }
    };

    fetchScores();
  }, [semesterFilter, yearFilter]);

  // ✅ Lọc điểm theo bộ lọc và lớp đang chọn
  useEffect(() => {
    if (!selectedClass) return;

    const byClass = allScores.filter(
      (s) =>
        String(s.class_id) === String(selectedClass.class_id) &&
        String(s.subject_id) === String(selectedClass.subject_id) &&
        s.semester.toUpperCase() === semesterFilter.toUpperCase() &&
        String(s.year) === yearFilter
    );

    if (byClass.length === 0) {
      setFilteredScores([]);
      setClassAverage(null);
      return;
    }

    const { regular_weight: rw = 1, mid_weight: mw = 2, final_weight: fw = 3 } = byClass[0];

    const enriched = byClass.map((s) => {
      const tx1 = +s.tx1 || 0,
        tx2 = +s.tx2 || 0,
        tx3 = +s.tx3 || 0,
        gk = +s.gk || 0,
        ck = +s.ck || 0;

      const avg = ((tx1 + tx2 + tx3) * rw + gk * mw + ck * fw) / (3 * rw + mw + fw);
      return { ...s, average: +avg.toFixed(2) };
    });

    const classAvg =
      enriched.reduce((sum, s) => sum + (s.average || 0), 0) / enriched.length;

    setFilteredScores(enriched);
    setClassAverage(classAvg.toFixed(2));
  }, [selectedClass, allScores, semesterFilter, yearFilter]);

  // ✅ Nhập/sửa điểm
  const handleScoreChange = async (row, field, value) => {
    const v = parseFloat(value);
    if (Number.isNaN(v)) return;

    const payload = {
      student_id: row.student_id,
      subject_id: row.subject_id,
      semester: semesterFilter,
      year: +yearFilter,
      tx1: row.tx1,
      tx2: row.tx2,
      tx3: row.tx3,
      gk: row.gk,
      ck: row.ck,
    };
    payload[field] = v;

    try {
      row.score_id
        ? await updateScore(row.score_id, payload)
        : await addScore(payload);

      const res = await getAllSubjectScores();
      setAllScores(res || []);
    } catch (err) {
      console.error("❌ Lỗi nhập/sửa điểm:", err);
    }
  };

  /* ---------- UI ---------- */
  if (selectedClass) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">
            {selectedClass.class_name} – {selectedClass.subject_name}
          </h2>
          <button
            className="px-4 py-1 border rounded text-sm"
            onClick={() => {
              setSelectedClass(null);
              setFilteredScores([]);
            }}
          >
            ← Quay lại
          </button>
        </div>

        <div className="flex gap-4 mb-2">
          <select
            value={semesterFilter}
            onChange={(e) => setSemesterFilter(e.target.value)}
            className="border p-1 rounded"
          >
            <option value="HK1">HK1</option>
            <option value="HK2">HK2</option>
          </select>

          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="border p-1 rounded"
          >
            {["2024", "2025", "2026"].map((y) => (
              <option key={y}>{y}</option>
            ))}
          </select>
        </div>

        <div className="border rounded-lg shadow bg-white p-4 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b bg-gray-50">
                {["#", "Học sinh", "Ngày sinh", "TX1", "TX2", "TX3", "GK", "CK", "TB"].map(
                  (h) => (
                    <th key={h} className="p-2 font-medium">
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {filteredScores.length === 0 ? (
                <tr>
                  <td colSpan="9" className="p-3 text-center text-gray-500">
                    Không có dữ liệu.
                  </td>
                </tr>
              ) : (
                <>
                  {filteredScores
  .sort((a, b) => a.student_name.localeCompare(b.student_name, "vi"))
  .map((s, idx) => (
    <tr
      key={`${s.student_id}-${selectedClass.subject_id}-${semesterFilter}-${yearFilter}`}
      className="border-b"
    >
      <td className="p-2">{idx + 1}</td>
      <td className="p-2">{s.student_name}</td>
      <td className="p-2">
        {new Date(s.date_of_birth).toLocaleDateString("vi-VN")}
      </td>

      {["tx1", "tx2", "tx3", "gk", "ck"].map((f) => (
        <td key={f} className="p-2">
          <input
            key={`${f}-${semesterFilter}-${yearFilter}`}        {/* 👈 ép remount input */}
            type="number"
            min="0"
            max="10"
            step="0.1"
            defaultValue={s[f] ?? ""}
            className="border rounded px-2 py-1 w-20 text-sm"
            onBlur={(e) => handleScoreChange(s, f, e.target.value)}
          />
        </td>
      ))}
      <td className="p-2 text-center">{s.average ?? "N/A"}</td>
    </tr>
  ))}

                  <tr className="border-t font-semibold bg-gray-100">
                    <td colSpan="8" className="p-2 text-right pr-4 italic">
                      → Trung bình lớp:
                    </td>
                    <td className="p-2 text-center">{classAverage ?? "N/A"}</td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {data.map((item) => (
        <div
          key={`${item.class_id}-${item.subject_id}`}
          className="rounded-lg border p-4 bg-white cursor-pointer hover:bg-blue-50 transition"
          onClick={() => setSelectedClass(item)}
        >
          <h3 className="font-semibold text-lg mb-1">
            {item.class_name} – {item.subject_name}
          </h3>
          <p>Sĩ số: {item.student_count}</p>
        </div>
      ))}
    </div>
  );
}
