import { useEffect, useState } from "react";
import { Link } from "react-router";
import { api } from "../services/api";

const RepairsCard = () => {
  const [pendingCount, setPendingCount] = useState<number | null>(null);

  useEffect(() => {
    const fetchPendingRepairs = async () => {
      try {
        const response = await api.get("/maintenance-requests/status/PENDING");
        setPendingCount(response.data.length);
      } catch (error: any) {
        console.error("Błąd podczas pobierania otwartych serwisów:", error);
        setPendingCount(0);
      }
    };

    fetchPendingRepairs();
  }, []);

  const formatNaprawyLabel = (count: number): string => {
    if (count === 1) return "1 oczekująca naprawa";
    if ([2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100)) {
      return `${count} oczekujące naprawy`;
    }
    return `${count} oczekujących napraw`;
  };

  return (
    <div className="col-sm-6 col-lg-3">
      <div className="card card-sm">
        <div className="card-body d-flex justify-content-between align-items-center">
          <div className="row align-items-center">
            <div className="col-auto">
              <span className="avatar bg-yellow-lt text-yellow">
                <i className="ti ti-tools fs-1" />
              </span>
            </div>
            <div className="col">
              <div className="font-weight-medium">
                {pendingCount !== null ? formatNaprawyLabel(pendingCount) : "..."}
              </div>
            </div>
            <div className="col-auto">
              <Link to="/RecepcionistDashboard/Orders/Repairs" className="btn btn-sm btn-warning">
                Zobacz
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RepairsCard;
