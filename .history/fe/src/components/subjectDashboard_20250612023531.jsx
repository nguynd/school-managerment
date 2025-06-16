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
  const [classAverage, setClassAverage] = useState(null);

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

      const enrichWithAverages = async () => {
        if (scores.length === 0) return;
        const subject = scores[0];
        const rw = subject.regular_weight ?? 1;
        const mw = subject.mid_weight ?? 2;
        const fw = subject.final_weight ?? 3;

        const updated = scores.map((s) => {
          const tx1 = parseFloat(s.tx1) || 0;
          const tx2 = parseFloat(s.tx2) || 0;
          const tx3 = parseFloat(s.tx3) || 0;
          const gk = parseFloat(s.gk) || 0;
          const ck = parseFloat(s.ck) || 0;

          const avg =
            ((tx1 + tx2 + tx3) * rw + gk * mw + ck * fw) /
            (3 * rw + mw + fw);

          return { ...s, average: isNaN(avg) ? "N/A" : avg.toFixed(2) };
        });

        const classAvg =
          updated.reduce((sum, s) => sum + parseFloat(s.average || 0), 0) /
          updated.length;

        setFilteredScores(updated);
        setClassAverage(classAvg.toFixed(2));
      };

      enrichWithAverages();
    }
  }, [selectedClass, allScores, semesterFilter, yearFilter]);

  const handleBack = () => {
    setSelectedClass(null);
    setFilteredScores([]);
  };

  const handleScoreChange = async (student, field, value) => {
    const scoreValue = parseFloat(value);
    if (isNaN(scoreValue)) return;

    const payload = {
      student_id: student.student_id,
      subject_id: student.subject_id,
      semester: semesterFilter,
      year: parseInt(yearFilter),
      tx1: student.tx1,
      tx2: student.tx2,
      tx3: student.tx3,
      gk: student.gk,
      ck: student.ck,
    };

    payload[field] = scoreValue;

    try {
      if (student.score_id) {
        await updateScore(student.score_id, payload);
      } else {
        await addScore(payload);
      }

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
                <th className="p-2">Ngày sinh</th>
                <th className="p-2">TX1</th>
                <th className="p-2">TX2</th>
                <th className="p-2">TX3</th>
                <th className="p-2">GK</th>
                <th className="p-2">CK</th>
                <th className="p-2">Trung bình</th>
              </tr>
            </thead>
            <tbody>
              {filteredScores.length === 0 ? (
                <tr>
                  <td colSpan="9" className="p-2 text-center text-gray-500">
                    Không có dữ liệu.
                  </td>
                </tr>
              ) : (
                <>
                  {[...filteredScores]
                    .sort((a, b) => {
                      const splitA = a.student_name.trim().split(" ");
                      const splitB = b.student_name.trim().split(" ");

                      const nameCompare = splitA.at(-1).localeCompare(splitB.at(-1), 'vi');
                      if (nameCompare !== 0) return nameCompare;

                      const middleA = splitA.slice(1, -1);
                      const middleB = splitB.slice(1, -1);
                      const max = Math.max(middleA.length, middleB.length);

                      for (let i = 1; i <= max; i++) {
                        const midA = middleA[middleA.length - i] || "";
                        const midB = middleB[middleB.length - i] || "";
                        const cmp = midA.localeCompare(midB, 'vi');
                        if (cmp !== 0) return cmp;
                      }

                      const familyCompare = splitA[0].localeCompare(splitB[0], 'vi');
                      if (familyCompare !== 0) return familyCompare;

                      // ✅ Nếu họ tên giống nhau hoàn toàn, so sánh theo student_id
                      return a.student_id - b.student_id;
                    })
                    .map((s, i) => (
                      <tr key={s.student_id} className="border-b">
                        <td className="p-2">{i + 1}</td>
                        <td className="p-2">{s.student_name}</td>
                        <td className="p-2">
                          {new Date(s.date_of_birth).toLocaleDateString("vi-VN")}
                        </td>
                        {["tx1", "tx2", "tx3", "gk", "ck"].map((field) => (
                          <td key={field} className="p-2">
                            <input
                              type="number"
                              step="0.1"
                              min="0"
                              max="10"
                              defaultValue={s[field] ?? ""}
                              className="border rounded px-2 py-1 w-20 text-sm"
                              onBlur={(e) => handleScoreChange(s, field, e.target.value)}
                            />
                          </td>
                        ))}
                        <td className="p-2 text-center">{s.average ?? "N/A"}</td>
                      </tr>
                  ))}

                  <tr className="border-t font-semibold bg-gray-50">
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
