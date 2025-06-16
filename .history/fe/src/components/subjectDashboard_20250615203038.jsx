import { useEffect, useState } from "react";
import { getSubjectClasses } from "../services/DashboardAPI";
import { useNavigate } from "react-router-dom";

export default function SubjectDashboard() {
  const [classList, setClassList] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await getSubjectClasses();
        console.log("📦 Dữ liệu lớp bộ môn từ API:", data);

        if (Array.isArray(data)) {
          data.forEach((item, index) => {
            console.log(`🔍 Lớp [${index}]:`, item);
          });
        }

        setClassList(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("❌ Lỗi khi lấy lớp bộ môn:", err);
      }
    };
    fetch();
  }, []);

  const handleClick = (cls) => {
    console.log("🧪 Click vào lớp:", cls);

    const classId = cls?.class_id;
    const subjectId = cls?.subject_id;

    if (!classId || !subjectId) {
      console.warn("⚠️ Thiếu class_id hoặc subject_id trong:", cls);
      alert("Không thể mở lớp vì thiếu ID lớp hoặc môn học.");
      return;
    }

    const path = `/subject/class/${classId}?subject=${subjectId}`;
    console.log("➡️ Điều hướng tới:", path);
    navigate(path);
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Điểm môn học</h2>

      {classList.length === 0 ? (
        <p className="text-gray-500 italic">Bạn chưa được phân công lớp nào.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          {classList.map((cls, index) => (
            <div
              key={index}
              onClick={() => handleClick(cls)}
              className="cursor-pointer border border-blue-500 rounded-2xl p-4 transition-all duration-200 bg-white hover:bg-blue-100"
            >
              <p className="font-semibold text-lg text-black">
                {cls.class_name} - {cls.subject_name}
              </p>
              <p className="text-sm text-gray-700">
                Sĩ số: {cls.student_count ?? 0}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
