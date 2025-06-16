import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getHomeroomClass } from "../services/DashboardAPI";
import HomeroomDashboard from "../components/HomeroomDashboard";
import SubjectDashboard from "../components/SubjectDashboard";

function Dashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");
  const activeTab = tabParam === "subject" ? "subject" : "homeroom";

  const [homeroomClass, setHomeroomClass] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (activeTab === "homeroom") {
        try {
          const data = await getHomeroomClass();
          console.log("📘 API lớp chủ nhiệm:", data);
          setHomeroomClass(data);
        } catch (err) {
          console.error("❌ Lỗi khi lấy lớp chủ nhiệm:", err);
        }
      }
      // 👉 Không fetch subjectClasses ở đây nữa
    };

    fetchData();
  }, [activeTab]);

  const handleTabChange = (tab) => {
    setSearchParams({ tab });
  };

  return (
    <div className="p-6 ml-64">
      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b">
        <button
          className={`pb-2 font-semibold ${
            activeTab === "homeroom"
              ? "border-b-2 border-blue-500 text-blue-600"
              : "text-gray-600"
          }`}
          onClick={() => handleTabChange("homeroom")}
        >
          Chủ nhiệm
        </button>
        <button
          className={`pb-2 font-semibold ${
            activeTab === "subject"
              ? "border-b-2 border-blue-500 text-blue-600"
              : "text-gray-600"
          }`}
          onClick={() => handleTabChange("subject")}
        >
          Bộ môn
        </button>
      </div>

      {/* Nội dung từng tab */}
      {activeTab === "homeroom" &&
        (homeroomClass?.class_id ? (
          <HomeroomDashboard data={homeroomClass} />
        ) : (
          <p className="text-gray-500">Đang tải lớp chủ nhiệm...</p>
        ))}

      {activeTab === "subject" && <SubjectDashboard />}
    </div>
  );
}

export default Dashboard;
