import { useEffect, useState } from "react";
import { api } from "../services/api";

const RoomStatusCard = () => {
  const [occupancyRate, setOccupancyRate] = useState<number | null>(null);

  useEffect(() => {
    const fetchRoomStatus = async () => {
      try {
        const response = await api.get("/reports/room-status");

        // Oblicz procent zajętości na podstawie danych
        const statusData = response.data.roomStatus || [];
        const occupiedRooms = statusData.find((s) => s.status === "OCCUPIED")?.count || 0;
        const totalRooms = statusData.reduce((sum, item) => sum + item.count, 0);

        setOccupancyRate(Math.round((occupiedRooms / totalRooms) * 100));
      } catch (error: any) {
        console.error("Błąd podczas pobierania statusu pokojów:", error);
        setOccupancyRate(0);
      }
    };

    fetchRoomStatus();
  }, []);

  return (
    <div className="col-sm-6 col-lg-3">
      <div className="card">
        <div className="card-body">
          <div className="d-flex align-items-center">
            <div className="subheader">Aktualne obłożenie</div>
          </div>

          <div
            className={`h1 ${
              occupancyRate === null
                ? ""
                : occupancyRate < 50
                  ? "text-danger"
                  : occupancyRate < 80
                    ? "text-warning"
                    : "text-success"
            }`}
          >
            {occupancyRate !== null ? `${occupancyRate}%` : "..."}
          </div>

          {occupancyRate !== null && (
            <>
              <div className="mb-2">Poziom obłożenia</div>

              <div className="progress progress-sm">
                <div
                  className="progress-bar bg-primary"
                  style={{ width: `${occupancyRate}%` }}
                  role="progressbar"
                  aria-valuenow={occupancyRate}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${occupancyRate}% obłożenia`}
                >
                  <span className="visually-hidden">{occupancyRate}% Complete</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoomStatusCard;
