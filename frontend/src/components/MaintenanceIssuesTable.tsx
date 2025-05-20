// @ts-nocheck

import React, { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import { api } from "../services/api";
import { useNotification } from "../contexts/notification";
import { useNavigate } from "react-router";
import RoomMaintenanceTable from "./RoomMaintenanceTable";

const MaintenanceIssuesTable = () => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [issuesByRoom, setIssuesByRoom] = useState([]);
  const [issuesByFloor, setIssuesByFloor] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRange, setSelectedRange] = useState("90days");
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 3); // Domyślnie ostatnie 3 miesiące
    return date.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });
  const [currentTab, setCurrentTab] = useState("rooms");

  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);

  useEffect(() => {
    fetchMaintenanceData();
  }, [startDate, endDate]);

  const setDateRangePeriod = (range) => {
    const today = new Date();
    let start = new Date();

    switch (range) {
      case "today":
        // Dzisiejsza data
        start = new Date(today);
        break;
      case "7days":
        // Ostatnie 7 dni
        start = new Date(today);
        start.setDate(start.getDate() - 7);
        break;
      case "30days":
        // Ostatnie 30 dni
        start = new Date(today);
        start.setDate(start.getDate() - 30);
        break;
      case "90days":
        // Ostatnie 90 dni
        start = new Date(today);
        start.setDate(start.getDate() - 90);
        break;
      default:
        start = new Date(today);
        start.setMonth(start.getMonth() - 3); // Domyślnie 3 miesiące
    }

    setStartDate(start.toISOString().split("T")[0]);
    setEndDate(today.toISOString().split("T")[0]);
    setSelectedRange(range);
  };

  const fetchMaintenanceData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append("startDate", startDate);
      
      const nextDay = new Date(endDate);
      nextDay.setDate(nextDay.getDate() + 1);
      const adjustedEndDate = nextDay.toISOString().split("T")[0];
      
      params.append("endDate", adjustedEndDate);

      const response = await api.get(`/reports/maintenance-issues?${params}`);
      setIssuesByRoom(response.data.issuesByRoom || []);
      setIssuesByFloor(response.data.issuesByFloor || []);
    } catch (err) {
      console.error("Błąd podczas pobierania danych o zgłoszeniach:", err);
      showNotification("error", "Nie udało się pobrać danych");
    } finally {
      setLoading(false);
    }
  };

  const handleShowDetails = (room, e) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedRoom(room);
    setShowMaintenanceModal(true);
  };

  const handleCloseMaintenanceModal = () => {
    setShowMaintenanceModal(false);
    setSelectedRoom(null);
  };

  if (loading)
    return (
      <div className="card">
        <div
          className="card-body d-flex justify-content-center align-items-center"
          style={{ minHeight: "320px" }}
        >
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Ładowanie...</span>
          </div>
        </div>
      </div>
    );

  return (
    <div className="card">
      <div className="card-header">
        <ul className="nav nav-tabs card-header-tabs">
          <li className="nav-item">
            <button
              className={`nav-link ${currentTab === "rooms" ? "active" : ""}`}
              onClick={() => setCurrentTab("rooms")}
            >
              Problemy według pokoju
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${currentTab === "floors" ? "active" : ""}`}
              onClick={() => setCurrentTab("floors")}
            >
              Problemy według piętra
            </button>
          </li>
        </ul>
      </div>

      <div className="card-body border-bottom py-3">
        <div className="d-flex flex-wrap gap-2 justify-content-between align-items-center mb-2">
          <div className="d-flex align-items-center">
            <h4 className="m-0">
              {currentTab === "rooms"
                ? "Częstotliwość zgłoszeń według pokoju"
                : "Częstotliwość zgłoszeń według piętra"}
            </h4>
          </div>
        </div>

        <div className="d-flex flex-wrap gap-2 justify-content-between align-items-center">
          <div className="btn-group">
            <button
              className={`btn ${selectedRange === "today" ? "btn-primary" : "btn-outline-primary"}`}
              onClick={() => setDateRangePeriod("today")}
            >
              Dziś
            </button>
            <button
              className={`btn ${selectedRange === "7days" ? "btn-primary" : "btn-outline-primary"}`}
              onClick={() => setDateRangePeriod("7days")}
            >
              7 dni
            </button>
            <button
              className={`btn ${selectedRange === "30days" ? "btn-primary" : "btn-outline-primary"}`}
              onClick={() => setDateRangePeriod("30days")}
            >
              30 dni
            </button>
            <button
              className={`btn ${selectedRange === "90days" ? "btn-primary" : "btn-outline-primary"}`}
              onClick={() => setDateRangePeriod("90days")}
            >
              90 dni
            </button>
          </div>

          <div className="d-flex flex-wrap gap-2 align-items-center">
            <div className="d-flex align-items-center">
              <span className="me-2">Od:</span>
              <input
                type="date"
                className="form-control form-control-sm"
                value={startDate}
                max={endDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setSelectedRange("custom");
                }}
              />
            </div>
            <div className="d-flex align-items-center">
              <span className="me-2">Do:</span>
              <input
                type="date"
                className="form-control form-control-sm"
                value={endDate}
                min={startDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setSelectedRange("custom");
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="table-responsive">
        {currentTab === "rooms" ? (
          <table className="table card-table table-vcenter datatable">
            <thead>
              <tr>
                <th>Pokój</th>
                <th>Piętro</th>
                <th>Liczba zgłoszeń</th>
                <th>Problemy</th>
              </tr>
            </thead>
            <tbody>
              {issuesByRoom.length > 0 ? (
                issuesByRoom.map((room) => (
                  <tr key={room.room_id}>
                    <td>{room.room_number}</td>
                    <td>{room.floor}</td>
                    <td>
                      <div className="d-flex align-items-center">
                        <span className="me-2">{room.issue_count}</span>
                        <div
                          className="progress progress-sm flex-grow-1"
                          style={{ width: "100px" }}
                        >
                          <div
                            className={`progress-bar bg-${getIssueCountColor(room.issue_count)}`}
                            style={{ width: `${getPercentageWidth(room.issue_count)}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={(e) => handleShowDetails(room, e)}
                      >
                        Pokaż szczegóły
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center">
                    Brak danych dla wybranego okresu
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        ) : (
          <table className="table card-table table-vcenter datatable">
            <thead>
              <tr>
                <th>Piętro</th>
                <th>Liczba zgłoszeń</th>
                <th>Liczba pokojów</th>
                <th>Zgłoszenia/pokój</th>
              </tr>
            </thead>
            <tbody>
              {issuesByFloor.length > 0 ? (
                issuesByFloor.map((floor) => (
                  <tr key={floor.floor}>
                    <td>{floor.floor}</td>
                    <td>{floor.issue_count}</td>
                    <td>{floor.room_count}</td>
                    <td>
                      <div className="d-flex align-items-center">
                        <span className="me-2">{floor.issues_per_room}</span>
                        <div
                          className="progress progress-sm flex-grow-1"
                          style={{ width: "100px" }}
                        >
                          <div
                            className={`progress-bar bg-${getIssueRateColor(floor.issues_per_room)}`}
                            style={{ width: `${Math.min(floor.issues_per_room * 20, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center">
                    Brak danych dla wybranego okresu
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal ze szczegółami napraw */}
      <Modal
        show={showMaintenanceModal}
        onHide={handleCloseMaintenanceModal}
        size="xl"
        dialogClassName="modal-dialog-scrollable"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedRoom && `Zgłoszenia serwisowe - Pokój ${selectedRoom.room_number} (Piętro ${selectedRoom.floor})`}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedRoom && (
            <RoomMaintenanceTable 
              roomId={selectedRoom.room_id} 
              roomNumber={selectedRoom.room_number}
              floor={selectedRoom.floor}
            />
          )}
        </Modal.Body>
        <Modal.Footer>
          <button className="btn btn-secondary" onClick={handleCloseMaintenanceModal}>
            Zamknij
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

const getIssueCountColor = (count) => {
  if (count <= 2) return "success";
  if (count <= 5) return "warning";
  return "danger";
};

const getIssueRateColor = (rate) => {
  if (rate < 1) return "success";
  if (rate < 2) return "warning";
  return "danger";
};

const getPercentageWidth = (count) => {
  const max = 10;
  return Math.min((count / max) * 100, 100);
};

export default MaintenanceIssuesTable;