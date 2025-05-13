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

  return (
    <div className="col-sm-6 col-lg-3">
      <div className="card card-sm">
        <div className="card-body">
          <div className="row align-items-center">
            <div className="col-auto">
              <span className="avatar bg-yellow-lt text-yellow">
                <i className="ti ti-tools fs-1" />
              </span>
            </div>
            <div className="col">
              <div className="font-weight-medium">
                {pendingCount !== null ? `${pendingCount} oczekujących napraw` : "..."}
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
