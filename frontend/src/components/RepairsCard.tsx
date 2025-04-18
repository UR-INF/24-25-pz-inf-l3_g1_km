import React, { useEffect, useState } from "react";
import { api } from "../services/api";

const RepairsCard = () => {
  const [pendingCount, setPendingCount] = useState<number | null>(null);

  useEffect(() => {
    const fetchPendingRepairs = async () => {
      try {
        const response = await api.get("/housekeeping-tasks/status/PENDING");
        setPendingCount(response.data.length);
      } catch (error: any) {
        console.error("Błąd podczas pobierania otwartych serwisów:", error);
        setPendingCount(0); // fallback
      }
    };

    fetchPendingRepairs();
  }, []);

  return (
    <div className="col-sm-6 col-lg-3">
      <div className="card">
        <div className="card-body">
          <div className="d-flex align-items-center">
            <div className="subheader">Otwarte serwisy</div>
          </div>
          <div className="h1 mb-3">{pendingCount !== null ? pendingCount : "..."}</div>
          <div className="d-flex mb-2">
            <div>
              <a href="/RecepcionistDashboard/Orders/Repairs" className="btn btn-primary">
                Zobacz
              </a>
            </div>
            <div className="ms-auto"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RepairsCard;
