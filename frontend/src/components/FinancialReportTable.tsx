import React, { useEffect, useState } from "react";
import { api } from "../services/api";
import { useNotification } from "../contexts/notification";

const FinancialReportTable = () => {
  const { showNotification } = useNotification();
  const [reportData, setReportData] = useState({
    revenueByPeriod: [],
    occupancyRevenueCorrelation: [],
    invoiceStatistics: {
      total_invoices: 0,
      total_reservations_with_invoices: 0,
      total_completed_reservations: 0,
      invoice_coverage_percentage: 0,
      company_invoices: 0,
      individual_invoices: 0,
    },
    financialSummary: {
      total_completed_reservations: 0,
      total_nights_sold: 0,
      total_revenue: 0,
      highest_room_rate: 0,
      lowest_room_rate: 0,
      avg_room_rate: 0,
      avg_daily_rate: 0,
      avg_revenue_per_day_of_period: 0,
    },
  });
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("month");
  const [dateRange, setDateRange] = useState({
    startDate: getDefaultStartDate(),
    endDate: new Date().toISOString().split("T")[0],
  });
  const [comparisonPeriod, setComparisonPeriod] = useState(null);
  const [comparisonData, setComparisonData] = useState(null);
  const [showComparison, setShowComparison] = useState(false);
  const [selectedRange, setSelectedRange] = useState("30days");

  // Helper function to get default start date (3 months ago)
  function getDefaultStartDate() {
    const date = new Date();
    date.setMonth(date.getMonth() - 3);
    return date.toISOString().split("T")[0];
  }

  // Efekt uruchamiany przy pierwszym renderowaniu
  useEffect(() => {
    // Ustaw domyślny zakres dat - wywołujemy jako funkcję
    setDateRangePeriod("30days");
  }, []);

  useEffect(() => {
    if (dateRange.startDate && dateRange.endDate) {
      fetchReportData();
    }
  }, [period, dateRange]);

  useEffect(() => {
    if (showComparison && comparisonPeriod) {
      fetchComparisonData();
    } else {
      setComparisonData(null);
    }
  }, [showComparison, comparisonPeriod]);

  const fetchReportData = async () => {
    try {
      setLoading(true);

      // Tworzenie parametrów do zapytania
      const params = new URLSearchParams();
      params.append("period", period);
      params.append("startDate", dateRange.startDate);
      params.append("endDate", dateRange.endDate);

      console.log("Pobieranie danych z parametrami:", params.toString());

      const response = await api.get(`/reports/financial?${params.toString()}`);

      console.log("Otrzymane dane:", response.data);
      setReportData(response.data);

      if (showComparison && !comparisonPeriod) {
        // Set default comparison period
        const compDates = getComparisonDateRange(dateRange.startDate, dateRange.endDate, period);
        setComparisonPeriod(compDates);
      }
    } catch (err) {
      console.error("Błąd podczas pobierania danych finansowych:", err);
      showNotification("error", "Nie udało się pobrać danych finansowych");
    } finally {
      setLoading(false);
    }
  };

  const fetchComparisonData = async () => {
    if (!comparisonPeriod) return;

    try {
      // Tworzenie parametrów do zapytania porównawczego
      const params = new URLSearchParams();
      params.append("period", period);
      params.append("startDate", comparisonPeriod.startDate);
      params.append("endDate", comparisonPeriod.endDate);

      console.log("Pobieranie danych porównawczych z parametrami:", params.toString());

      const response = await api.get(`/reports/financial?${params.toString()}`);

      setComparisonData(response.data);
    } catch (err) {
      console.error("Błąd podczas pobierania danych porównawczych:", err);
      showNotification("error", "Nie udało się pobrać danych porównawczych");
    }
  };

  // Helper function to get comparison date range
  function getComparisonDateRange(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diff = end.getTime() - start.getTime();
    const daysDiff = diff / (1000 * 3600 * 24);

    const compStart = new Date(start);
    const compEnd = new Date(end);

    compStart.setDate(compStart.getDate() - daysDiff - 1);
    compEnd.setDate(compEnd.getDate() - daysDiff - 1);

    return {
      startDate: compStart.toISOString().split("T")[0],
      endDate: compEnd.toISOString().split("T")[0],
    };
  }

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
      case "quarter":
        // Bieżący kwartał
        const currentMonth = today.getMonth();
        const quarterStartMonth = Math.floor(currentMonth / 3) * 3;
        start = new Date(today.getFullYear(), quarterStartMonth, 1);
        break;
      case "year":
        // Bieżący rok
        start = new Date(today.getFullYear(), 0, 1);
        break;
      case "custom":
        // Niestandardowy zakres - nie zmieniaj dat
        return;
      default:
        start = new Date(today);
        start.setMonth(start.getMonth() - 3); // Domyślnie 3 miesiące
    }

    // Formatowanie dat do formatu YYYY-MM-DD
    setDateRange({
      startDate: start.toISOString().split("T")[0],
      endDate: today.toISOString().split("T")[0],
    });
    setSelectedRange(range);
  };

  const toggleComparison = () => {
    const newShowComparison = !showComparison;
    setShowComparison(newShowComparison);

    // If enabling comparison and no comparison period set yet
    if (newShowComparison && !comparisonPeriod) {
      const compDates = getComparisonDateRange(dateRange.startDate, dateRange.endDate);
      setComparisonPeriod(compDates);
    }
  };

  const handlePeriodChange = (e) => {
    setPeriod(e.target.value);
  };

  const handleDateChange = (e, field) => {
    setDateRange({
      ...dateRange,
      [field]: e.target.value,
    });
    setSelectedRange("custom");
  };

  const handleComparisonDateChange = (e, field) => {
    setComparisonPeriod({
      ...comparisonPeriod,
      [field]: e.target.value,
    });
  };

  const handleResetFilters = () => {
    setPeriod("month");
    setDateRangePeriod("30days");
    setShowComparison(false);
    setComparisonPeriod(null);
  };

  const formatCurrency = (value) =>
    new Intl.NumberFormat("pl-PL", { style: "currency", currency: "PLN" }).format(
      Number(value) || 0,
    );

  const formatPercent = (value) =>
    new Intl.NumberFormat("pl-PL", { style: "percent", minimumFractionDigits: 2 }).format(
      Number(value) / 100 || 0,
    );

  const getPercentChange = (current, previous) => {
    if (!previous || previous === 0) return null;
    const change = ((current - previous) / previous) * 100;
    return change;
  };

  const renderPercentChange = (current, previous) => {
    const change = getPercentChange(current, previous);
    if (change === null) return "-";

    const formattedChange = change.toFixed(2) + "%";
    const className = change >= 0 ? "text-success" : "text-danger";
    const icon = change >= 0 ? "↑" : "↓";

    return (
      <span className={className}>
        {icon} {formattedChange}
      </span>
    );
  };

  if (loading && !reportData.revenueByPeriod?.length) {
    return (
      <div className="card">
        <div className="card-body text-center p-4">
          <div className="spinner-border" role="status"></div>
          <div className="mt-3">Ładowanie danych...</div>
        </div>
      </div>
    );
  }

  const formatPeriodLabel = (periodValue) => {
    // Format the period label based on the type (week, month, quarter, day)
    if (periodValue?.includes("-W")) {
      // Weekly format (2024-W12)
      const [year, week] = periodValue.split("-W");
      return `Tydzień ${week}, ${year}`;
    } else if (periodValue?.includes("-Q")) {
      // Quarterly format (2024-Q1)
      const [year, quarter] = periodValue.split("-Q");
      return `${quarter} kwartał ${year}`;
    } else if (periodValue?.match(/^\d{4}-\d{2}$/)) {
      // Monthly format (2024-03)
      const [year, month] = periodValue.split("-");
      const date = new Date(year, month - 1);
      return date.toLocaleDateString("pl-PL", { month: "long", year: "numeric" });
    } else {
      // Daily or other format
      try {
        const date = new Date(periodValue);
        if (!isNaN(date)) {
          return date.toLocaleDateString("pl-PL");
        }
      } catch (e) {}

      // Return as is if not recognized
      return periodValue || "";
    }
  };

  // Bezpieczne sprawdzanie czy dane są dostępne
  const finSummary = reportData.financialSummary || {};
  const invStats = reportData.invoiceStatistics || {};
  const revPeriod = reportData.revenueByPeriod || [];
  const occRevCorr = reportData.occupancyRevenueCorrelation || [];

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Raport finansowy</h3>
        <div className="card-actions">
          <div className="btn-group">
            <button
              className={`btn btn-sm ${selectedRange === "today" ? "btn-primary" : "btn-outline-primary"}`}
              onClick={() => setDateRangePeriod("today")}
            >
              Dziś
            </button>
            <button
              className={`btn btn-sm ${selectedRange === "7days" ? "btn-primary" : "btn-outline-primary"}`}
              onClick={() => setDateRangePeriod("7days")}
            >
              7 dni
            </button>
            <button
              className={`btn btn-sm ${selectedRange === "30days" ? "btn-primary" : "btn-outline-primary"}`}
              onClick={() => setDateRangePeriod("30days")}
            >
              30 dni
            </button>
            <button
              className={`btn btn-sm ${selectedRange === "quarter" ? "btn-primary" : "btn-outline-primary"}`}
              onClick={() => setDateRangePeriod("quarter")}
            >
              Kwartał
            </button>
            <button
              className={`btn btn-sm ${selectedRange === "year" ? "btn-primary" : "btn-outline-primary"}`}
              onClick={() => setDateRangePeriod("year")}
            >
              Rok
            </button>
          </div>
        </div>
      </div>

      <div className="card-body border-bottom py-3">
        <div className="d-flex flex-wrap gap-3 mb-3">
          <div>
            <label className="form-label">Grupowanie</label>
            <select className="form-select" value={period} onChange={handlePeriodChange}>
              <option value="day">Dziennie</option>
              <option value="week">Tygodniowo</option>
              <option value="month">Miesięcznie</option>
              <option value="quarter">Kwartalnie</option>
            </select>
          </div>

          <div>
            <label className="form-label">Data początkowa</label>
            <input
              type="date"
              className="form-control"
              value={dateRange.startDate}
              onChange={(e) => handleDateChange(e, "startDate")}
            />
          </div>

          <div>
            <label className="form-label">Data końcowa</label>
            <input
              type="date"
              className="form-control"
              value={dateRange.endDate}
              onChange={(e) => handleDateChange(e, "endDate")}
            />
          </div>

          <div className="d-flex align-items-end">
            <div className="form-check form-switch">
              <input
                className="form-check-input"
                type="checkbox"
                checked={showComparison}
                onChange={toggleComparison}
                id="compareSwitch"
              />
              <label className="form-check-label" htmlFor="compareSwitch">
                Porównaj z okresem
              </label>
            </div>
          </div>

          <div className="d-flex align-items-end">
            <button className="btn btn-outline-secondary" onClick={handleResetFilters}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="icon icon-tabler icon-tabler-refresh"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                <path d="M20 11a8.1 8.1 0 0 0 -15.5 -2m-.5 -4v4h4"></path>
                <path d="M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4"></path>
              </svg>
              Resetuj
            </button>
          </div>
        </div>

        {showComparison && comparisonPeriod && (
          <div className="d-flex flex-wrap gap-3 mb-3 ps-4 border-start">
            <div>
              <label className="form-label">Porównanie - data początkowa</label>
              <input
                type="date"
                className="form-control"
                value={comparisonPeriod.startDate}
                onChange={(e) => handleComparisonDateChange(e, "startDate")}
              />
            </div>
            <div>
              <label className="form-label">Porównanie - data końcowa</label>
              <input
                type="date"
                className="form-control"
                value={comparisonPeriod.endDate}
                onChange={(e) => handleComparisonDateChange(e, "endDate")}
              />
            </div>
          </div>
        )}
      </div>

      {/* Podsumowanie finansowe */}
      <div className="card-body border-bottom">
        <h4 className="mb-3">Podsumowanie finansowe</h4>
        <div className="row g-3">
          <div className="col-md-6 col-lg-3">
            <div className="card card-sm">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <div className="subheader">Całkowity przychód</div>
                </div>
                <div className="h1 mb-0">{formatCurrency(finSummary.total_revenue)}</div>
                {showComparison && comparisonData && comparisonData.financialSummary && (
                  <div className="d-flex align-items-center mt-1">
                    <div className="subheader me-2">
                      Poprzednio: {formatCurrency(comparisonData.financialSummary.total_revenue)}
                    </div>
                    {renderPercentChange(
                      finSummary.total_revenue,
                      comparisonData.financialSummary.total_revenue,
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="col-md-6 col-lg-3">
            <div className="card card-sm">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <div className="subheader">Liczba rezerwacji</div>
                </div>
                <div className="h1 mb-0">{finSummary.total_completed_reservations || 0}</div>
                {showComparison && comparisonData && comparisonData.financialSummary && (
                  <div className="d-flex align-items-center mt-1">
                    <div className="subheader me-2">
                      Poprzednio:{" "}
                      {comparisonData.financialSummary.total_completed_reservations || 0}
                    </div>
                    {renderPercentChange(
                      finSummary.total_completed_reservations,
                      comparisonData.financialSummary.total_completed_reservations,
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="col-md-6 col-lg-3">
            <div className="card card-sm">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <div className="subheader">Średnia stawka dzienna</div>
                </div>
                <div className="h1 mb-0">{formatCurrency(finSummary.avg_daily_rate)}</div>
                {showComparison && comparisonData && comparisonData.financialSummary && (
                  <div className="d-flex align-items-center mt-1">
                    <div className="subheader me-2">
                      Poprzednio: {formatCurrency(comparisonData.financialSummary.avg_daily_rate)}
                    </div>
                    {renderPercentChange(
                      finSummary.avg_daily_rate,
                      comparisonData.financialSummary.avg_daily_rate,
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="col-md-6 col-lg-3">
            <div className="card card-sm">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <div className="subheader">Liczba sprzedanych noclegów</div>
                </div>
                <div className="h1 mb-0">{finSummary.total_nights_sold || 0}</div>
                {showComparison && comparisonData && comparisonData.financialSummary && (
                  <div className="d-flex align-items-center mt-1">
                    <div className="subheader me-2">
                      Poprzednio: {comparisonData.financialSummary.total_nights_sold || 0}
                    </div>
                    {renderPercentChange(
                      finSummary.total_nights_sold,
                      comparisonData.financialSummary.total_nights_sold,
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Przychody w okresach */}
      <div className="card-body border-bottom">
        <h4 className="mb-3">Przychody w okresach</h4>
        <div className="table-responsive">
          <table className="table card-table table-vcenter">
            <thead>
              <tr>
                <th>Okres</th>
                <th>Liczba rezerwacji</th>
                <th>Przychód</th>
                {showComparison && comparisonData && <th>Zmiana przychodu</th>}
              </tr>
            </thead>
            <tbody>
              {revPeriod && revPeriod.length > 0 ? (
                revPeriod.map((item, index) => {
                  const compItem = showComparison && comparisonData?.revenueByPeriod?.[index];

                  return (
                    <tr key={index}>
                      <td>{formatPeriodLabel(item.period)}</td>
                      <td>{item.reservation_count || 0}</td>
                      <td>{formatCurrency(item.total_revenue)}</td>
                      {showComparison && comparisonData && (
                        <td>
                          {compItem ? (
                            <>
                              {formatCurrency(compItem.total_revenue)}{" "}
                              {renderPercentChange(item.total_revenue, compItem.total_revenue)}
                            </>
                          ) : (
                            "-"
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={showComparison ? 4 : 3} className="text-center">
                    Brak danych do wyświetlenia
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Korelacje obłożenia z przychodami */}
      <div className="card-body border-bottom">
        <h4 className="mb-3">Obłożenie a przychody</h4>
        <div className="table-responsive">
          <table className="table card-table table-vcenter">
            <thead>
              <tr>
                <th>Okres</th>
                <th>Wykorzystane pokoje</th>
                <th>% wykorzystania</th>
                <th>Łączne noce</th>
                <th>Przychód</th>
                <th>Średni przychód / noc</th>
              </tr>
            </thead>
            <tbody>
              {occRevCorr && occRevCorr.length > 0 ? (
                occRevCorr.map((item, index) => (
                  <tr key={index}>
                    <td>{formatPeriodLabel(item.period)}</td>
                    <td>{item.unique_rooms_used || 0}</td>
                    <td>{formatPercent(item.room_usage_percentage || 0)}</td>
                    <td>{item.total_nights || 0}</td>
                    <td>{formatCurrency(item.total_revenue)}</td>
                    <td>{formatCurrency(item.avg_revenue_per_night)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center">
                    Brak danych do wyświetlenia
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Statystyki fakturowania */}
      <div className="card-body">
        <h4 className="mb-3">Statystyki fakturowania</h4>
        <div className="row g-3">
          <div className="col-md-6 col-lg-3">
            <div className="card card-sm">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <div className="subheader">Liczba faktur</div>
                </div>
                <div className="h1 mb-0">{invStats.total_invoices || 0}</div>
                {showComparison && comparisonData && comparisonData.invoiceStatistics && (
                  <div className="d-flex align-items-center mt-1">
                    <div className="subheader me-2">
                      Poprzednio: {comparisonData.invoiceStatistics.total_invoices || 0}
                    </div>
                    {renderPercentChange(
                      invStats.total_invoices,
                      comparisonData.invoiceStatistics.total_invoices,
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="col-md-6 col-lg-3">
            <div className="card card-sm">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <div className="subheader">Pokrycie fakturami</div>
                </div>
                <div className="h1 mb-0">
                  {formatPercent(invStats.invoice_coverage_percentage || 0)}
                </div>
                {showComparison && comparisonData && comparisonData.invoiceStatistics && (
                  <div className="d-flex align-items-center mt-1">
                    <div className="subheader me-2">
                      Poprzednio:{" "}
                      {formatPercent(
                        comparisonData.invoiceStatistics.invoice_coverage_percentage || 0,
                      )}
                    </div>
                    {renderPercentChange(
                      invStats.invoice_coverage_percentage,
                      comparisonData.invoiceStatistics.invoice_coverage_percentage,
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="col-md-6 col-lg-3">
            <div className="card card-sm">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <div className="subheader">Faktury dla firm</div>
                </div>
                <div className="h1 mb-0">{invStats.company_invoices || 0}</div>
                {showComparison && comparisonData && comparisonData.invoiceStatistics && (
                  <div className="d-flex align-items-center mt-1">
                    <div className="subheader me-2">
                      Poprzednio: {comparisonData.invoiceStatistics.company_invoices || 0}
                    </div>
                    {renderPercentChange(
                      invStats.company_invoices,
                      comparisonData.invoiceStatistics.company_invoices,
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="col-md-6 col-lg-3">
            <div className="card card-sm">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <div className="subheader">Faktury dla osób fizycznych</div>
                </div>
                <div className="h1 mb-0">{invStats.individual_invoices || 0}</div>
                {showComparison && comparisonData && comparisonData.invoiceStatistics && (
                  <div className="d-flex align-items-center mt-1">
                    <div className="subheader me-2">
                      Poprzednio: {comparisonData.invoiceStatistics.individual_invoices || 0}
                    </div>
                    {renderPercentChange(
                      invStats.individual_invoices,
                      comparisonData.invoiceStatistics.individual_invoices,
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialReportTable;
