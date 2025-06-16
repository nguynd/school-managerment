import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getHomeroomClass, getSubjectClasses } from "../services/DashboardAPI";
import HomeroomDashboard from "../components/HomeroomDashboard";
import SubjectDashboard from "../components/SubjectDashboard";

function Dashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");
  const activeTab = tabParam === "subject" ? "subject" : "homeroom";

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
          setSubjectClasses(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("Lỗi lấy dữ liệu:", err);
      }
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

      {/* Tab content */}
      {activeTab === "homeroom" && <HomeroomDashboard data={homeroomClass} />}
      {activeTab === "subject" && <SubjectDashboard data={subjectClasses} />}
    </div>
  );
}

export default Dashboard;
