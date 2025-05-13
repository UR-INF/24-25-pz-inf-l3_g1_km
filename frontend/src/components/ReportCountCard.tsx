import { useEffect, useState } from "react";
import { Link } from "react-router";
import { api } from "../services/api";

const ReportCountCard = () => {
  const [reportCount, setReportCount] = useState<number | null>(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await api.get("/reports/saved");
        setReportCount(response.data.length);
      } catch (error) {
        console.error("Błąd podczas pobierania raportów:", error);
        setReportCount(0);
      }
    };

    fetchReports();
  }, []);

  return (
    <div className="col-sm-6 col-lg-3">
      <div className="card card-sm">
        <div className="card-body">
          <div className="row align-items-center">
            <div className="col-auto">
              <span className="avatar bg-indigo-lt text-indigo">
                <i className="ti ti-file-report fs-1" />
              </span>
            </div>
            <div className="col">
              <div className="font-weight-medium">
                {reportCount !== null ? `${reportCount} raportów` : "..."}
              </div>
            </div>
            <div className="col-auto">
              <Link to="/ManagerDashboard/Reports" className="btn btn-sm btn-indigo">
                Zobacz
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportCountCard;
