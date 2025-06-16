import { useState, useEffect } from "react";
import { getAllSubjectScores } from "../services/DashboardAPI";

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
        setAllScores([]);
      }
    };
    fetchScores();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      const scores = allScores.filter((s) =>
  s.class_name.toLowerCase().trim() === selectedClass.class_name.toLowerCase().trim() &&
  s.subject_name.toLowerCase().trim() === selectedClass.subject_name.toLowerCase().trim() &&
  s.semester.toUpperCase() === semesterFilter.toUpperCase() &&
  s.year.toString() === yearFilter.toString()
);


      // Gộp điểm theo học sinh
      const grouped = {};
      scores.forEach((s) => {
        if (!grouped[s.student_name]) {
          grouped[s.student_name] = { TX: "", GK: "", CK: "" };
        }

        if (s.label?.toUpperCase().startsWith("TX")) {
          grouped[s.student_name].TX = s.score;
        } else if (s.label === "GK") {
          grouped[s.student_name].GK = s.score;
        } else if (s.label === "CK") {
          grouped[s.student_name].CK = s.score;
        }
      });

      const rows = Object.entries(grouped).map(([name, scores]) => ({
        name,
        ...scores,
      }));

      setFilteredScores(rows);
    }
  }, [selectedClass, allScores, semesterFilter, yearFilter]);

  const handleBack = () => {
    setSelectedClass(null);
    setFilteredScores([]);
  };

  if (selectedClass) {
    return (
      <div className="space-y-4">
        {/* Header */}
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

        {/* Bảng điểm */}
        <div className="border rounded-lg shadow bg-white p-4">
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
                filteredScores.map((row, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-2">{index + 1}</td>
                    <td className="p-2">{row.name}</td>
                    <td className="p-2">{row.TX || "-"}</td>
                    <td className="p-2">{row.GK || "-"}</td>
                    <td className="p-2">{row.CK || "-"}</td>
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
          onClick={() => {
  console.log("👆 Click lớp:", item);
  setSelectedClass(item);
}}
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
