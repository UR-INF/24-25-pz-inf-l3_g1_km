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

  const formatRaportyLabel = (count: number): string => {
    if (count === 1) return "1 raport";
    if ([2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100)) {
      return `${count} raporty`;
    }
    return `${count} raportów`;
  };

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
                {reportCount !== null ? formatRaportyLabel(reportCount) : "..."}
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
