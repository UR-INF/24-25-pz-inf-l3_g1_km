import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { api } from "../services/api";
import { useNotification } from "../contexts/notification";

interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  role: {
    name: RoleName;
  };
  avatarUrl: string;
}

type RoleName = string;

interface PerformanceData {
  employeeId: number;
  employeeName: string;
  roleName: string;
  housekeepingTasks: number;
  maintenanceTasks: number;
  totalTasks: number;
  completed: number;
  successRate: number;
  avgTimeToComplete: number | string;
  id: number;
  firstName: string;
  lastName: string;
  role: {
    name: string;
  };
  avatarUrl: string;
}

const StaffPerformanceTable = () => {
  const { showNotification } = useNotification();
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);
  const [filterTaskType, setFilterTaskType] = useState("ALL");

  // Inicjalizacja dat z dzisiejszą datą
  const today = new Date();
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1); // Domyślnie ostatni miesiąc
    return date.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState(() => today.toISOString().split("T")[0]);
  const [selectedRange, setSelectedRange] = useState<string>("30days");

  // Efekt uruchamiany przy pierwszym renderowaniu i przy zmianie dat
  useEffect(() => {
    // Najpierw ustawiamy domyślny zakres dat
    setDateRange("30days");
  }, []);

  // Efekt dla ładowania danych przy zmianie dat
  useEffect(() => {
    if (startDate && endDate) {
      fetchPerformanceData();
    }
  }, [startDate, endDate]);

  const fetchPerformanceData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);

      console.log("Pobieranie danych z parametrami:", params.toString());

      const response = await api.get(`/reports/staff-performance?${params}`);
      console.log("Otrzymane dane:", response.data);

      // Funkcja transformująca dane do odpowiedniego formatu
      const transformData = (data) => {
        return data.map(employee => {
          // Rozdzielamy imię i nazwisko z pełnego nazwiska (jeśli istnieje)
          const nameParts = (employee.employee_name || "").split(" ");
          const firstName = nameParts[0] || "";
          const lastName = nameParts.slice(1).join(" ") || "";

          return {
            // Przekształcenie z snake_case na camelCase
            employeeId: employee.employee_id,
            employeeName: employee.employee_name,
            roleName: employee.role_name,
            housekeepingTasks: employee.housekeeping_tasks || 0,
            maintenanceTasks: employee.maintenance_tasks || 0,
            totalTasks: employee.total_tasks || 0,
            completed: employee.completed || 0,
            successRate: employee.success_rate || 0,
            avgTimeToComplete: employee.avg_hours_to_complete || '-',

            // Dodatkowe dane dla interfejsu Employee
            id: employee.employee_id,
            firstName: firstName,
            lastName: lastName,
            role: {
              name: employee.role_name || ""
            },
            avatarUrl: employee.avatar_url || ""
          };
        });
      };

      let transformedData = [];
      if (response.data.tasksByEmployee && Array.isArray(response.data.tasksByEmployee)) {
        transformedData = transformData(response.data.tasksByEmployee);
      } else if (Array.isArray(response.data)) {
        transformedData = transformData(response.data);
      } else {
        console.error("Nieoczekiwana struktura danych:", response.data);
        showNotification("error", "Nieprawidłowa struktura danych z API");
      }

      setPerformanceData(transformedData);
    } catch (err) {
      console.error("Błąd podczas pobierania danych wydajności:", err);
      showNotification("error", "Nie udało się pobrać danych");
      setPerformanceData([]);
    } finally {
      setLoading(false);
    }
  };

  const setDateRange = (range: string) => {
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
      case "quarter":
        // Bieżący kwartał
        const currentMonth = today.getMonth();
        const quarterStartMonth = Math.floor(currentMonth / 3) * 3;
        start = new Date(today.getFullYear(), quarterStartMonth, 1);
        break;
      case "custom":
        // Niestandardowy zakres - nie zmieniaj dat
        return;
      default:
        start = new Date(today);
    }

    // Formatowanie dat do formatu YYYY-MM-DD
    setStartDate(start.toISOString().split("T")[0]);
    setEndDate(today.toISOString().split("T")[0]);
    setSelectedRange(range);
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStartDate(e.target.value);
    setSelectedRange("custom");
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEndDate(e.target.value);
    setSelectedRange("custom");
  };

  const handleResetFilters = () => {
    setSearch("");
    setItemsPerPage(8);
    setFilterTaskType("ALL");
    setCurrentPage(1);
    setDateRange("30days");
  };

  // Zabezpieczenie przed pustymi danymi
  const safePerformanceData = Array.isArray(performanceData) ? performanceData : [];

  const filteredData = safePerformanceData
    .filter((employee) => {
      if (!employee) return false;
      const name = employee.employeeName || "";
      return name.toLowerCase().includes(search.toLowerCase());
    })
    .filter((employee) => {
      if (!employee) return false;
      if (filterTaskType === "ALL") return true;

      const housekeepingTasks = employee.housekeepingTasks || 0;
      const maintenanceTasks = employee.maintenanceTasks || 0;

      return filterTaskType === "HOUSEKEEPING" ? housekeepingTasks > 0 : maintenanceTasks > 0;
    });

  const totalPages = Math.max(1, Math.ceil(filteredData.length / itemsPerPage));
  const currentData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Wydajność personelu</h3>
        <div className="card-actions">
          <div className="btn-group">
            <button
              className={`btn btn-sm ${selectedRange === "today" ? "btn-primary" : "btn-outline-primary"}`}
              onClick={() => setDateRange("today")}
            >
              Dziś
            </button>
            <button
              className={`btn btn-sm ${selectedRange === "7days" ? "btn-primary" : "btn-outline-primary"}`}
              onClick={() => setDateRange("7days")}
            >
              7 dni
            </button>
            <button
              className={`btn btn-sm ${selectedRange === "30days" ? "btn-primary" : "btn-outline-primary"}`}
              onClick={() => setDateRange("30days")}
            >
              30 dni
            </button>
            <button
              className={`btn btn-sm ${selectedRange === "quarter" ? "btn-primary" : "btn-outline-primary"}`}
              onClick={() => setDateRange("quarter")}
            >
              Kwartał
            </button>
          </div>
        </div>
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
            <div>
              <label className="form-label small text-muted mb-1">Od</label>
              <input
                type="date"
                className="form-control form-control-sm"
                value={startDate}
                onChange={handleStartDateChange}
              />
            </div>
            <div>
              <label className="form-label small text-muted mb-1">Do</label>
              <input
                type="date"
                className="form-control form-control-sm"
                value={endDate}
                onChange={handleEndDateChange}
              />
            </div>

            <div>
              <label className="form-label small text-muted mb-1">Typ zadania</label>
              <select
                className="form-select form-select-sm"
                style={{ width: "170px" }}
                value={filterTaskType}
                onChange={(e) => setFilterTaskType(e.target.value)}
              >
                <option value="ALL">Wszystkie zadania</option>
                <option value="HOUSEKEEPING">Tylko sprzątanie</option>
                <option value="MAINTENANCE">Tylko konserwacja</option>
              </select>
            </div>

            <div>
              <label className="form-label small text-muted mb-1">Szukaj pracownika</label>
              <input
                type="text"
                className="form-control form-control-sm"
                style={{ width: "180px" }}
                placeholder="Imię Nazwisko..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>


            <button className="btn btn-outline-secondary btn-sm" onClick={handleResetFilters}>
              Resetuj
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="card-body">
          <div className="text-center my-5">
            <div className="spinner-border text-primary" role="status"></div>
            <p className="mt-2">Ładowanie danych...</p>
          </div>
        </div>
      ) : filteredData.length === 0 ? (
        <div className="card-body">
          <div className="text-center my-5">
            <div className="h3">Brak danych</div>
            <p className="text-muted">
              Nie znaleziono danych dla wybranych kryteriów. Spróbuj zmienić zakres dat lub filtry.
            </p>
          </div>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table card-table table-vcenter text-nowrap datatable">
            <thead>
              <tr>
                <th>Pracownik</th>
                <th>Stanowisko</th>
                <th>Zadania porządkowe</th>
                <th>Zadania konserwacyjne</th>
                <th>Łącznie zadań</th>
                <th>Wykonane</th>
                <th>Wskaźnik realizacji</th>
                <th>Średni czas (godz.)</th>
              </tr>
            </thead>
            <tbody>
              {currentData.map((employee, index) => {
                // Bezpieczne uzyskiwanie wartości wskaźnika sukcesu
                const successRate = typeof employee.successRate === 'number' ? employee.successRate : 0;

                return (
                  <tr key={employee.employeeId || index}>
                    <td>
                      <div className="d-flex py-1 align-items-center">
                        <span
                          className="avatar shadow avatar-sm me-2"
                          style={{
                            backgroundImage: employee.avatarUrl ? `url(${employee.avatarUrl})` : "none",
                          }}
                        ></span>
                        <div className="flex-fill">
                          <div className="font-weight-medium">{employee.employeeName || "Nieznany"}</div>
                        </div>
                      </div>
                    </td>
                    <td>{employee.roleName || "-"}</td>
                    <td>{employee.housekeepingTasks || 0}</td>
                    <td>{employee.maintenanceTasks || 0}</td>
                    <td>{employee.totalTasks || 0}</td>
                    <td>{employee.completed || 0}</td>
                    <td>
                      <div className="progress progress-sm">
                        <div
                          className={`progress-bar bg-${getSuccessRateColor(successRate)}`}
                          style={{ width: `${successRate}%` }}
                        ></div>
                      </div>
                      <div className="text-center">{successRate}%</div>
                    </td>
                    <td>{employee.avgTimeToComplete || "-"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="card-footer d-flex align-items-center">
        <p className="m-0 text-secondary">
          {filteredData.length > 0 ? (
            <>
              Wyświetlono <span>{(currentPage - 1) * itemsPerPage + 1}</span> do{" "}
              <span>{Math.min(currentPage * itemsPerPage, filteredData.length)}</span> z{" "}
              <span>{filteredData.length}</span> wyników
            </>
          ) : (
            "Brak danych do wyświetlenia"
          )}
        </p>
        {filteredData.length > 0 && (
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
        )}
      </div>
    </div>
  );
};

const getSuccessRateColor = (rate) => {
  if (rate >= 90) return "success";
  if (rate >= 70) return "warning";
  return "danger";
};

export default StaffPerformanceTable;