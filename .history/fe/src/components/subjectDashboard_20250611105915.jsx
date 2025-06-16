import { useState, useEffect } from "react";
import { getAllSubjectScores } from "../services/DashboardAPI";

function SubjectDashboard({ data }) {
  const [selectedClass, setSelectedClass] = useState(null);
  const [allScores, setAllScores] = useState([]);
  const [filteredScores, setFilteredScores] = useState([]);

  useEffect(() => {
    // Gọi 1 lần khi mở tab Bộ môn
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
    if (selectedClass && allScores.length > 0) {
      const scoresForClass = allScores.filter(
        (score) => score.class_name === selectedClass.class_name && score.subject_name === selectedClass.subject_name
      );
      setFilteredScores(scoresForClass);
    }
  }, [selectedClass, allScores]);

  const handleBack = () => {
    setSelectedClass(null);
    setFilteredScores([]);
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
        <div className="border rounded-lg shadow bg-white p-4">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b">
                <th className="p-2">#</th>
                <th className="p-2">Học sinh</th>
                <th className="p-2">Môn</th>
                <th className="p-2">Điểm</th>
                <th className="p-2">Loại</th>
                <th className="p-2">Học kỳ</th>
                <th className="p-2">Năm</th>
              </tr>
            </thead>
            <tbody>
              {filteredScores.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-2 text-center text-gray-500">
                    Không có dữ liệu điểm.
                  </td>
                </tr>
              ) : (
                filteredScores.map((score, index) => (
                  <tr key={score.score_id} className="border-b">
                    <td className="p-2">{index + 1}</td>
                    <td className="p-2">{score.student_name}</td>
                    <td className="p-2">{score.subject_name}</td>
                    <td className="p-2">{score.score}</td>
                    <td className="p-2">{score.label}</td>
                    <td className="p-2">{score.semester}</td>
                    <td className="p-2">{score.year}</td>
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
