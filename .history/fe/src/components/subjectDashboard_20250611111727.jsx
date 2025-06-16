import { useEffect, useState } from "react";
import {
  getAllSubjectScores,
  addScore,
  updateScore,
} from "../services/DashboardAPI";

function SubjectDashboard({ data }) {
  const [selectedClass, setSelectedClass] = useState(null);
  const [allScores, setAllScores] = useState([]);
  const [filteredScores, setFilteredScores] = useState([]);

  const [semesterFilter, setSemesterFilter] = useState("HK1");
  const [yearFilter, setYearFilter] = useState("2024");

  useEffect(() => {
    const fetchScores = async () => {
      try {
        const res = await getAllSubjectScores();
        setAllScores(res || []);
      } catch (error) {
        console.error("Lỗi lấy điểm:", error);
      }
    };
    fetchScores();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      const scores = allScores.filter(
        (s) =>
          s.class_name.toLowerCase().trim() === selectedClass.class_name.toLowerCase().trim() &&
          s.subject_name.toLowerCase().trim() === selectedClass.subject_name.toLowerCase().trim() &&
          s.semester.toUpperCase() === semesterFilter.toUpperCase() &&
          s.year.toString() === yearFilter
      );

      // Gom điểm theo học sinh
      const grouped = {};
      scores.forEach((s) => {
        if (!grouped[s.student_id]) {
          grouped[s.student_id] = {
            student_id: s.student_id,
            student_name: s.student_name,
            subject_id: s.subject_id,
            TX: null,
            GK: null,
            CK: null,
          };
        }

        const label = s.label.toUpperCase();
        if (label.startsWith("TX")) grouped[s.student_id].TX = { score: s.score, score_id: s.score_id };
        else if (label === "GK") grouped[s.student_id].GK = { score: s.score, score_id: s.score_id };
        else if (label === "CK") grouped[s.student_id].CK = { score: s.score, score_id: s.score_id };
      });

      setFilteredScores(Object.values(grouped));
    }
  }, [selectedClass, allScores, semesterFilter, yearFilter]);

  const handleBack = () => {
    setSelectedClass(null);
    setFilteredScores([]);
  };

  const handleScoreChange = async (student, label, value) => {
    const scoreValue = parseFloat(value);
    if (isNaN(scoreValue)) return;

    const existing = student[label];
    const payload = {
      student_id: student.student_id,
      subject_id: student.subject_id,
      semester: semesterFilter,
      year: parseInt(yearFilter),
      label,
      score: scoreValue,
    };

    try {
      if (existing && existing.score_id) {
        // Sửa điểm
        await updateScore(existing.score_id, scoreValue);
      } else {
        // Thêm điểm
        await addScore(payload);
      }

      // Load lại điểm sau khi nhập
      const updated = await getAllSubjectScores();
      setAllScores(updated);
    } catch (err) {
      console.error("Lỗi nhập/sửa điểm:", err);
    }
  };

  if (selectedClass) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">
            {selectedClass.class_name} - {selectedClass.subject_name}
          </h2>
          <button
            className="px-4 py-1 border rounded text-sm text-gray-700"
            onClick={handleBack}
          >
            ← Quay lại
          </button>
        </div>

        {/* Bộ lọc */}
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
            <option value="2024">2024</option>
            <option value="2025">2025</option>
          </select>
        </div>

        <div className="border rounded-lg shadow bg-white p-4 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b">
                <th className="p-2">#</th>
                <th className="p-2">Học sinh</th>
                <th className="p-2">TX</th>
                <th className="p-2">GK</th>
                <th className="p-2">CK</th>
              </tr>
            </thead>
            <tbody>
              {filteredScores.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-2 text-center text-gray-500">
                    Không có dữ liệu.
                  </td>
                </tr>
              ) : (
                filteredScores.map((s, i) => (
                  <tr key={s.student_id} className="border-b">
                    <td className="p-2">{i + 1}</td>
                    <td className="p-2">{s.student_name}</td>
                    {["TX", "GK", "CK"].map((type) => (
                      <td key={type} className="p-2">
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="10"
                          defaultValue={s[type]?.score ?? ""}
                          className="border rounded px-2 py-1 w-20 text-sm"
                          onBlur={(e) => handleScoreChange(s, type, e.target.value)}
                        />
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) return <p>Không có lớp bộ môn.</p>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {data.map((item, index) => (
        <div
          key={index}
          onClick={() => setSelectedClass(item)}
          className="rounded-lg border p-4 shadow-sm bg-white cursor-pointer hover:bg-blue-50 transition"
        >
          <h3 className="font-semibold text-lg mb-1">
            {item.class_name} - {item.subject_name}
          </h3>
          <p>Sĩ số: {item.student_count}</p>
        </div>
      ))}
    </div>
  );
}

export default SubjectDashboard;
