import React, { useState, useEffect } from "react";
import { api } from "../services/api";

const StaffPerformanceCard = () => {
  const [completionRate, setCompletionRate] = useState<number | null>(null);
  const [totalCompleted, setTotalCompleted] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Stan dla filtrów czasowych
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [selectedRange, setSelectedRange] = useState<string>("today");

  // Funkcja do ustawiania predefiniowanych zakresów dat
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
    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(today.toISOString().split('T')[0]);
    setSelectedRange(range);
  };

  // Efekt dla inicjalizacji domyślnego zakresu dat
  useEffect(() => {
    setDateRange("today");
  }, []);

  // Efekt dla pobierania danych na podstawie zakresów dat
  useEffect(() => {
    if (startDate && endDate) {
      fetchStaffPerformance();
    }
  }, [startDate, endDate]);

  const fetchStaffPerformance = async () => {
    try {
      setLoading(true);
      
      // Tworzenie parametrów zapytania
      const params = new URLSearchParams();
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);
      
      const response = await api.get(`/reports/staff-performance?${params}`);
      
      // Dostosowanie do nowej struktury danych
      // Sprawdzamy, czy mamy dane w tasksByType
      if (response.data.tasksByType && Array.isArray(response.data.tasksByType)) {
        const tasks = response.data.tasksByType;
        
        if (tasks.length) {
          const totalTasks = tasks.reduce((sum: number, type: any) => sum + (type.total_count || 0), 0);
          const completedTasks = tasks.reduce((sum: number, type: any) => sum + (type.completed_count || 0), 0);
          
          setTotalCompleted(completedTasks);
          
          if (totalTasks > 0) {
            setCompletionRate(Math.round((completedTasks / totalTasks) * 100));
          } else {
            setCompletionRate(0);
          }
        } else {
          setTotalCompleted(0);
          setCompletionRate(0);
        }
      } 
      // Alternatywnie, sprawdzamy czy mamy dane w successRate
      else if (response.data.successRate && Array.isArray(response.data.successRate)) {
        const successRateData = response.data.successRate;
        
        // Obliczamy ogólny wskaźnik sukcesu na podstawie wszystkich zadań
        let totalAssigned = 0;
        let totalCompleted = 0;
        
        successRateData.forEach((item: any) => {
          totalAssigned += (item.total_assigned || 0);
          totalCompleted += (item.completed || 0);
        });
        
        setTotalCompleted(totalCompleted);
        
        if (totalAssigned > 0) {
          setCompletionRate(Math.round((totalCompleted / totalAssigned) * 100));
        } else {
          setCompletionRate(0);
        }
      }
      // Sprawdzamy czy mamy dane w tasksByEmployee
      else if (response.data.tasksByEmployee && Array.isArray(response.data.tasksByEmployee)) {
        const employees = response.data.tasksByEmployee;
        
        let totalTasks = 0;
        let completedTasks = 0;
        
        employees.forEach((employee: any) => {
          totalTasks += (employee.total_tasks || 0);
          completedTasks += (employee.completed || 0);
        });
        
        setTotalCompleted(completedTasks);
        
        if (totalTasks > 0) {
          setCompletionRate(Math.round((completedTasks / totalTasks) * 100));
        } else {
          setCompletionRate(0);
        }
      }
      // Jeśli mamy bezpośrednią tablicę danych (bez zagnieżdżenia)
      else if (Array.isArray(response.data)) {
        let totalTasks = 0;
        let completedTasks = 0;
        
        response.data.forEach((item: any) => {
          if (item.total_tasks) {
            totalTasks += item.total_tasks;
            completedTasks += (item.completed || 0);
          } else if (item.total_count) {
            totalTasks += item.total_count;
            completedTasks += (item.completed_count || 0);
          }
        });
        
        setTotalCompleted(completedTasks);
        
        if (totalTasks > 0) {
          setCompletionRate(Math.round((completedTasks / totalTasks) * 100));
        } else {
          setCompletionRate(0);
        }
      } else {
        console.error("Nieznany format danych:", response.data);
        setTotalCompleted(0);
        setCompletionRate(0);
      }
    } catch (error: any) {
      console.error("Błąd podczas pobierania danych wydajności:", error);
      setCompletionRate(0);
      setTotalCompleted(0);
    } finally {
      setLoading(false);
    }
  };

  // Obsługa zmiany dat w inputach
  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStartDate(e.target.value);
    setSelectedRange("custom");
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEndDate(e.target.value);
    setSelectedRange("custom");
  };

  // Funkcja do określania koloru na podstawie wskaźnika realizacji
  const getCompletionRateColor = (rate: number | null) => {
    if (rate === null) return "secondary";
    if (rate >= 90) return "success";
    if (rate >= 70) return "warning";
    return "danger";
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Wskaźnik realizacji zadań</h3>
        <div className="card-actions">
          <div className="btn-group">
            <button 
              className={`btn btn-sm ${selectedRange === 'today' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setDateRange('today')}
            >
              Dziś
            </button>
            <button 
              className={`btn btn-sm ${selectedRange === '7days' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setDateRange('7days')}
            >
              7 dni
            </button>
            <button 
              className={`btn btn-sm ${selectedRange === '30days' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setDateRange('30days')}
            >
              30 dni
            </button>
            <button 
              className={`btn btn-sm ${selectedRange === 'quarter' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setDateRange('quarter')}
            >
              Kwartał
            </button>
          </div>
        </div>
      </div>
      
      <div className="card-body">
        <div className="row align-items-center">
          <div className="col-lg-6">
            <div className="d-flex">
              <div className="me-4">
                <div className="text-muted">Wskaźnik ukończonych zadań</div>
                <div className="h1">
                  {loading ? (
                    <div className="spinner-border spinner-border-sm text-primary" role="status"></div>
                  ) : (
                    <span className={`text-${getCompletionRateColor(completionRate)}`}>
                      {completionRate !== null ? completionRate : 0}%
                    </span>
                  )}
                </div>
                <div>
                  Ukończone zadania: {loading ? "..." : (totalCompleted !== null ? totalCompleted : 0)}
                </div>
              </div>
            </div>
            {!loading && completionRate !== null && (
              <div className="mt-3">
                <div className="progress progress-sm">
                  <div 
                    className={`progress-bar bg-${getCompletionRateColor(completionRate)}`}
                    style={{ width: `${completionRate}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
          
          <div className="col-lg-6 mt-3 mt-lg-0">
            <div className="mb-2">Niestandardowy zakres:</div>
            <div className="d-flex gap-2">
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
            </div>
          </div>
        </div>
      </div>
      
      <div className="card-footer">
        <div className="d-flex justify-content-between">
          <span className="text-muted">Dane za okres: {startDate} do {endDate}</span>
        </div>
      </div>
    </div>
  );
};

export default StaffPerformanceCard;