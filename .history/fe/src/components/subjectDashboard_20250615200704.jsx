import { useEffect, useState } from "react";
import { getSubjectClasses } from "../services/DashboardAPI";
import { useNavigate } from "react-router-dom";

export default function SubjectDashboard() {
  const [classList, setClassList] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetch = async () => {
      const data = await getSubjectClasses();
      // Lọc ra những lớp có class_id hợp lệ
      const filtered = data.filter((cls) => cls.class_id !== undefined && cls.class_id !== null);
      setClassList(filtered);
    };
    fetch();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Điểm môn học</h2>

      {classList.length === 0 ? (
        <p className="text-gray-500 italic">Bạn chưa được phân công lớp nào.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          {classList.map((cls) => (
            <div
              key={cls.class_id}
              onClick={() => navigate(`/subject/class/${cls.class_id}`)}
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
