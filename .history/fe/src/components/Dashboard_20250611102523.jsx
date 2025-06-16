import { useEffect, useState } from "react";
import { getHomeroomClass, getSubjectClasses } from "../services/DashboardAPI";

function Dashboard() {
  const [activeTab, setActiveTab] = useState("homeroom");
  const [homeroomClass, setHomeroomClass] = useState(null);
  const [subjectClasses, setSubjectClasses] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (activeTab === "homeroom") {
          const data = await getHomeroomClass();
          setHomeroomClass(data);
        } else {
          const data = await getSubjectClasses();
          setSubjectClasses(data);
        }
      } catch (err) {
        console.error("Lỗi lấy dữ liệu:", err);
      }
    };

    fetchData();
  }, [activeTab]);

  return (
    <div className="p-6">
      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b">
        <button
          className={`pb-2 font-semibold ${
            activeTab === "homeroom"
              ? "border-b-2 border-blue-500 text-blue-600"
              : "text-gray-600"
          }`}
          onClick={() => setActiveTab("homeroom")}
        >
          Chủ nhiệm
        </button>
        <button
          className={`pb-2 font-semibold ${
            activeTab === "subject"
              ? "border-b-2 border-blue-500 text-blue-600"
              : "text-gray-600"
          }`}
          onClick={() => setActiveTab("subject")}
        >
          Bộ môn
        </button>
      </div>

      {/* Nội dung tab */}
      {activeTab === "homeroom" && (
        <div>
          {homeroomClass ? (
            <div className="rounded-lg border p-4 shadow-md bg-white">
              <h2 className="text-xl font-bold mb-2">
                Lớp chủ nhiệm: {homeroomClass.class_name}
              </h2>
              <p>Sĩ số: {homeroomClass.student_count}</p>
            </div>
          ) : (
            <p>Không chủ nhiệm lớp nào.</p>
          )}
        </div>
      )}

      {activeTab === "subject" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {subjectClasses.length === 0 && <p>Không có lớp bộ môn.</p>}
          {subjectClasses.map((item, index) => (
            <div
              key={index}
              className="rounded-lg border p-4 shadow-sm bg-white"
            >
              <h3 className="font-semibold text-lg mb-1">
                {item.class_name} - {item.subject_name}
              </h3>
              <p>Sĩ số: {item.student_count}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Dashboard;
