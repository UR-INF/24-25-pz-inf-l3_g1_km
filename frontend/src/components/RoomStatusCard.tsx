import { useEffect, useState } from "react";
import { Link } from "react-router";
import { api } from "../services/api";

const RoomStatusCard = () => {
  const [occupancyRate, setOccupancyRate] = useState<number | null>(null);
  const [maintenanceRooms, setMaintenanceRooms] = useState<number | null>(null);

  useEffect(() => {
    const fetchRoomStatus = async () => {
      try {
        const response = await api.get("/reports/room-status");

        // Oblicz procent zajętości na podstawie danych
        const statusData = response.data.roomStatus || [];
        const occupiedRooms = statusData.find((s) => s.status === "OCCUPIED")?.count || 0;
        const totalRooms = statusData.reduce((sum, item) => sum + item.count, 0);

        setOccupancyRate(Math.round((occupiedRooms / totalRooms) * 100));

        // Liczba pokojów wymagających konserwacji
        const maintenance = response.data.roomsNeedingMaintenance || [];
        setMaintenanceRooms(maintenance.length);
      } catch (error: any) {
        console.error("Błąd podczas pobierania statusu pokojów:", error);
        setOccupancyRate(0);
        setMaintenanceRooms(0);
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
          <div className="h1 mb-3">{occupancyRate !== null ? `${occupancyRate}%` : "..."}</div>
          <div className="d-flex mb-2">
            <div>
              Pokoje wymagające serwisu: {maintenanceRooms !== null ? maintenanceRooms : "..."}
            </div>
            {/* <div className="ms-auto">
              <Link to="/Reports/RoomStatus" className="btn btn-primary">
                Szczegóły
              </Link>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomStatusCard;
