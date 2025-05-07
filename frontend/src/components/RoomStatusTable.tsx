import React, { useEffect, useState } from "react";
import { api } from "../services/api";
import { useNotification } from "../contexts/notification";

const RoomStatusTable = () => {
  const { showNotification } = useNotification();
  const [roomsData, setRoomsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterFloor, setFilterFloor] = useState("ALL");

  useEffect(() => {
    fetchRoomsData();
  }, []);

  const fetchRoomsData = async () => {
    try {
      setLoading(true);
      const response = await api.get("/reports/room-status");

      console.log("Dane z API:", response.data); // Dodane dla debugowania

      // Wyodrębnienie potrzebnych danych
      const revenueData = response.data.revenuePerRoom || [];
      const maintenanceData = response.data.roomsNeedingMaintenance || [];

      // Dodatkowy endpoint do pobrania statusów wszystkich pokojów
      const roomsResponse = await api.get("/rooms");
      const allRooms = roomsResponse.data || [];

      console.log("Wszystkie pokoje:", allRooms);

      // Utwórz mapę z room_id -> status dla wszystkich pokojów
      const roomStatusMap = allRooms.reduce((acc, room) => {
        acc[room.id] = room.status;
        return acc;
      }, {});

      // Utwórz mapę dla pokojów wymagających konserwacji
      const maintenanceMap = maintenanceData.reduce((acc, room) => {
        acc[room.roomId || room.room_id] = {
          maintenanceIssue: room.maintenanceIssue || room.maintenance_issue,
          maintenanceStatus: room.maintenanceStatus || room.maintenance_status,
          maintenanceRequestId: room.maintenanceRequestId || room.maintenance_request_id,
        };
        return acc;
      }, {});

      // Wzbogacenie danych o przychody i informacje o konserwacji
      const enrichedData = revenueData.map((room) => {
        const roomId = room.roomId || room.room_id;
        return {
          room_id: roomId,
          room_number: room.roomNumber || room.room_number,
          floor: room.floor,
          bed_count: room.bedCount || room.bed_count,
          price_per_night: room.pricePerNight || room.price_per_night,
          status: roomStatusMap[roomId] || "UNKNOWN", // Dodanie statusu z mapy
          total_reservations: room.totalReservations || room.total_reservations || 0,
          days_occupied: room.daysOccupied || room.days_occupied || 0,
          total_revenue: room.totalRevenue || room.total_revenue || 0,
          revenue_per_day: room.revenuePerDay || room.revenue_per_day || 0,
          has_maintenance: !!maintenanceMap[roomId],
          maintenance_issue: maintenanceMap[roomId]?.maintenanceIssue,
          maintenance_status: maintenanceMap[roomId]?.maintenanceStatus,
        };
      });

      console.log("Wzbogacone dane:", enrichedData); // Dodane dla debugowania

      setRoomsData(enrichedData);
    } catch (err) {
      console.error("Błąd podczas pobierania danych pokojów:", err);
      showNotification("error", "Nie udało się pobrać danych");
    } finally {
      setLoading(false);
    }
  };

  const handleResetFilters = () => {
    setSearch("");
    setItemsPerPage(8);
    setFilterStatus("ALL");
    setFilterFloor("ALL");
    setCurrentPage(1);
  };

  // Unikalne piętra do filtrowania
  const floors = Array.from(new Set(roomsData.map((room) => room.floor))).sort();

  const filteredData = roomsData
    .filter((room) => (room.room_number || "").toString().includes(search))
    .filter((room) => {
      if (filterStatus === "ALL") return true;
      if (filterStatus === "MAINTENANCE") return room.has_maintenance;
      return room.status === filterStatus;
    })
    .filter((room) => filterFloor === "ALL" || (room.floor || "").toString() === filterFloor);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const formatCurrency = (value) =>
    new Intl.NumberFormat("pl-PL", { style: "currency", currency: "PLN" }).format(value || 0);

  if (loading) return <div>Ładowanie danych...</div>;

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Status pokojów</h3>
      </div>

      <div className="card-body border-bottom py-3">
        <div className="d-flex flex-wrap gap-2 justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-2 text-secondary">
            <span>Pokaż</span>
            <select
              className="form-select form-select-sm"
              style={{ width: "80px" }}
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
            >
              {[5, 8, 10, 20, 50].map((count) => (
                <option key={count} value={count}>
                  {count}
                </option>
              ))}
            </select>
            <span>wyników</span>
          </div>

          <div className="d-flex flex-wrap gap-2 align-items-center">
            <select
              className="form-select form-select-sm"
              style={{ width: "170px" }}
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="ALL">Wszystkie statusy</option>
              <option value="AVAILABLE">Dostępne</option>
              <option value="OCCUPIED">Zajęte</option>
              <option value="OUT_OF_SERVICE">W serwisie</option>
              <option value="MAINTENANCE">Wymagające konserwacji</option>
            </select>

            <select
              className="form-select form-select-sm"
              style={{ width: "120px" }}
              value={filterFloor}
              onChange={(e) => setFilterFloor(e.target.value)}
            >
              <option value="ALL">Wszystkie piętra</option>
              {floors.map((floor) => (
                <option key={floor} value={floor}>
                  Piętro {floor}
                </option>
              ))}
            </select>

            <input
              type="text"
              className="form-control form-control-sm"
              style={{ width: "150px" }}
              placeholder="Numer pokoju..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <button className="btn btn-outline-secondary btn-sm" onClick={handleResetFilters}>
              Resetuj
            </button>
          </div>
        </div>
      </div>

      <div className="table-responsive">
        <table className="table card-table table-vcenter text-nowrap datatable">
          <thead>
            <tr>
              <th>Pokój</th>
              <th>Piętro</th>
              <th>Ilość łóżek</th>
              <th>Status</th>
              <th>Stawka/doba</th>
              <th>Rezerwacje</th>
              <th>Dni zajętości</th>
              <th>Przychód</th>
              <th>Średnia/dzień</th>
            </tr>
          </thead>
          <tbody>
            {currentData.length > 0 ? (
              currentData.map((room) => (
                <tr key={room.room_id}>
                  <td>{room.room_number}</td>
                  <td>{room.floor}</td>
                  <td>{room.bed_count}</td>
                  <td>
                    {room.status && (
                      <span className={`badge text-white bg-${getRoomStatusColor(room.status)}`}>
                        {translateRoomStatus(room.status)}
                      </span>
                    )}
                    {room.has_maintenance && (
                      <span
                        className="badge text-white bg-warning ms-1"
                        title={room.maintenance_issue}
                      >
                        Zgłoszenie konserwacji
                      </span>
                    )}
                  </td>
                  <td>{formatCurrency(room.price_per_night)}</td>
                  <td>{room.total_reservations || 0}</td>
                  <td>{room.days_occupied || 0}</td>
                  <td>{formatCurrency(room.total_revenue || 0)}</td>
                  <td>{formatCurrency(room.revenue_per_day || 0)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" className="text-center">
                  Brak danych do wyświetlenia
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="card-footer d-flex align-items-center">
        <p className="m-0 text-secondary">
          Wyświetlono{" "}
          <span>{filteredData.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</span> do{" "}
          <span>{Math.min(currentPage * itemsPerPage, filteredData.length)}</span> z{" "}
          <span>{filteredData.length}</span> wyników
        </p>
        <ul className="pagination m-0 ms-auto">
          <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
            <button
              className="page-link"
              onClick={() => setCurrentPage((p) => p - 1)}
              disabled={currentPage === 1}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="icon icon-1"
              >
                <path d="M15 6l-6 6l6 6"></path>
              </svg>
              poprzednia
            </button>
          </li>
          {Array.from({ length: totalPages }, (_, i) => (
            <li className={`page-item ${i + 1 === currentPage ? "active" : ""}`} key={i}>
              <button className="page-link" onClick={() => setCurrentPage(i + 1)}>
                {i + 1}
              </button>
            </li>
          ))}
          <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
            <button
              className="page-link"
              onClick={() => setCurrentPage((p) => p + 1)}
              disabled={currentPage === totalPages}
            >
              następna
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="icon icon-1"
              >
                <path d="M9 6l6 6l-6 6"></path>
              </svg>
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
};

const getRoomStatusColor = (status) => {
  switch (status) {
    case "AVAILABLE":
      return "success";
    case "OCCUPIED":
      return "primary";
    case "OUT_OF_SERVICE":
      return "danger";
    case "UNKNOWN":
      return "secondary";
    default:
      return "secondary";
  }
};

const translateRoomStatus = (status) => {
  switch (status) {
    case "AVAILABLE":
      return "Dostępny";
    case "OCCUPIED":
      return "Zajęty";
    case "OUT_OF_SERVICE":
      return "W serwisie";
    case "UNKNOWN":
      return "Nieznany";
    default:
      return status;
  }
};

export default RoomStatusTable;
