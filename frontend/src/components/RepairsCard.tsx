import React, { useEffect, useState } from "react";
import { api } from "../services/api";

const RepairsCard = () => {
  const [pendingCount, setPendingCount] = useState<number | null>(null);

  useEffect(() => {
    const fetchOpenRepairs = async () => {
      try {
        const [pendingRes, inProgressRes] = await Promise.all([
          api.get("/maintenance-requests/status/PENDING"),
          api.get("/maintenance-requests/status/IN_PROGRESS"),
        ]);

        const totalOpen = pendingRes.data.length + inProgressRes.data.length;
        setPendingCount(totalOpen);
      } catch (error: any) {
        console.error("Błąd podczas pobierania otwartych serwisów:", error);
        setPendingCount(0); // fallback
      }
    };

    fetchOpenRepairs();
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
