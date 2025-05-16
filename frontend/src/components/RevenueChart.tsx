// @ts-nocheck

import React, { useEffect, useState } from "react";
import ApexChart from "react-apexcharts";
import { api } from "../services/api";
import { useTheme } from "../contexts/theme";

const RevenueChart = () => {
  const [chartData, setChartData] = useState([]);
  const [chartLabels, setChartLabels] = useState([]);
  const [percentChange, setPercentChange] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("month");
  const [selectedRange, setSelectedRange] = useState("12months");
  const [dateRange, setDateRange] = useState({
    startDate: getDefaultStartDate("12months"),
    endDate: new Date().toISOString().split("T")[0],
  });
  const [error, setError] = useState(null);

  // Helper function to get default start date based on range
  function getDefaultStartDate(range) {
    const date = new Date();

    switch (range) {
      case "3months":
        date.setMonth(date.getMonth() - 3);
        break;
      case "6months":
        date.setMonth(date.getMonth() - 6);
        break;
      case "12months":
        date.setMonth(date.getMonth() - 12);
        break;
      case "year":
        date.setMonth(0); // January
        date.setDate(1); // 1st day of month
        break;
      default:
        date.setMonth(date.getMonth() - 12);
    }

    return date.toISOString().split("T")[0];
  }

  // Set date range based on predefined periods
  const setDateRangePeriod = (range) => {
    const endDate = new Date().toISOString().split("T")[0];
    const startDate = getDefaultStartDate(range);

    setDateRange({
      startDate: startDate,
      endDate: endDate,
    });
    setSelectedRange(range);
  };

  // Handle custom date changes
  const handleDateChange = (e, field) => {
    setDateRange({
      ...dateRange,
      [field]: e.target.value,
    });
    setSelectedRange("custom");
  };

  // Handle period change
  const handlePeriodChange = (e) => {
    setPeriod(e.target.value);
  };

  useEffect(() => {
    fetchRevenueData();
  }, [period, dateRange]);

  const fetchRevenueData = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      params.append("period", period);
      params.append("startDate", dateRange.startDate);
      params.append("endDate", dateRange.endDate);

      console.log("Pobieranie danych przychodów z parametrami:", params.toString());

      const res = await api.get(`/reports/financial?${params.toString()}`);
      console.log("Otrzymane dane:", res.data);

      if (!res.data || !res.data.revenueByPeriod) {
        console.error("Brak danych lub nieprawidłowa struktura odpowiedzi:", res.data);
        setError("Otrzymano nieprawidłowe dane z API");
        setLoading(false);
        return;
      }

      const revenue = res.data.revenueByPeriod || [];

      const labels = revenue.map((r) => formatPeriodLabel(r.period, period));
      const values = revenue.map((r) => Number(r.total_revenue) || 0);

      if (values.length >= 2) {
        const lastValue = values[values.length - 1] || 0;
        const prevValue = values[values.length - 2] || 1; // Unikaj dzielenia przez 0
        const change =
          lastValue > 0 && prevValue > 0
            ? Math.round(((lastValue - prevValue) / prevValue) * 100)
            : 0;
        setPercentChange(change);
      } else {
        setPercentChange(0);
      }

      // Suma przychodów
      const total = values.reduce((sum, val) => sum + val, 0);

      setChartLabels(labels);
      setChartData(values);
      setTotalRevenue(total);
    } catch (err) {
      console.error("Błąd podczas pobierania danych przychodów:", err);
      setError("Nie udało się pobrać danych przychodów. Spróbuj ponownie później.");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) =>
    new Intl.NumberFormat("pl-PL", { style: "currency", currency: "PLN" }).format(value);

  const formatPeriodLabel = (periodValue, periodType) => {
    if (!periodValue) return "";

    if (periodValue.includes("-W")) {
      // Weekly format (2024-W12)
      const [year, week] = periodValue.split("-W");
      return `T${week}`;
    } else if (periodValue.includes("-Q")) {
      // Quarterly format (2024-Q1)
      const [year, quarter] = periodValue.split("-Q");
      return `Q${quarter}`;
    } else if (periodValue.match(/^\d{4}-\d{2}$/)) {
      // Monthly format (2024-03)
      const [year, month] = periodValue.split("-");
      const date = new Date(year, month - 1);
      return date.toLocaleDateString("pl-PL", { month: "short", year: "numeric" });
    } else {
      // Daily or other format
      try {
        const date = new Date(periodValue);
        if (!isNaN(date)) {
          return date.toLocaleDateString("pl-PL", {
            day: "2-digit",
            month: periodType === "day" ? "2-digit" : "short",
          });
        }
      } catch (e) {}

      // Return as is if not recognized
      return periodValue;
    }
  };
  const { currentTheme } = useTheme();

  return (
    <div className="card">
      <div className="card-header border-0">
        <div className="card-title d-flex align-items-center">
          <div>Przychody – trend {getPeriodName(period)}</div>
          <div className="ms-2">
            <div className="btn-group">
              <select
                className="form-select form-select-sm"
                value={period}
                onChange={handlePeriodChange}
              >
                <option value="day">Dziennie</option>
                <option value="week">Tygodniowo</option>
                <option value="month">Miesięcznie</option>
                <option value="quarter">Kwartalnie</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div
          className="card-body d-flex justify-content-center align-items-center"
          style={{ minHeight: "320px" }}
        >
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Ładowanie...</span>
          </div>
        </div>
      ) : error ? (
        <div
          className="card-body d-flex justify-content-center align-items-center"
          style={{ minHeight: "320px" }}
        >
          <div className="text-danger">{error}</div>
        </div>
      ) : (
        <>
          <div className="position-relative">
            <div className="position-absolute top-0 left-0 px-3 mt-1 w-75">
              <div className="row g-2">
                <div className="col-auto">
                  <div
                    className="chart-sparkline chart-sparkline-square"
                    style={{ minHeight: "41px" }}
                  >
                    <ApexChart
                      options={{
                        chart: {
                          type: "radialBar",
                          height: 40,
                          width: 40,
                          sparkline: { enabled: true },
                        },
                        plotOptions: {
                          radialBar: {
                            hollow: { margin: 0, size: "75%" },
                            track: { margin: 0 },
                            dataLabels: { show: false },
                          },
                        },
                        tooltip: { enabled: false },
                        colors: [percentChange >= 0 ? "#5eba00" : "#cd201f"],
                      }}
                      series={[Math.abs(percentChange)]}
                      type="radialBar"
                      height={40}
                      width={40}
                    />
                  </div>
                </div>
                <div className="col">
                  <div>Łączny przychód: {formatCurrency(totalRevenue || 0)}</div>
                  <div className={`text-${percentChange >= 0 ? "success" : "danger"}`}>
                    {percentChange >= 0 ? "+" : ""}
                    {percentChange}% w porównaniu z poprzednim okresem
                  </div>
                </div>
              </div>
            </div>

            <div id="chart-revenue-activity" style={{ minHeight: "320px", marginTop: "50px" }}>
              {chartData.length > 0 ? (
                <ApexChart
                  options={{
                    chart: {
                      type: "area",
                      height: 320,
                      sparkline: { enabled: false },
                      toolbar: { show: false },
                      zoom: { enabled: true },
                      fontFamily: "inherit",
                      background: "transparent",
                    },
                    dataLabels: {
                      enabled: false,
                    },
                    stroke: {
                      curve: "smooth",
                      width: 2,
                    },
                    fill: {
                      type: "gradient",
                      gradient: {
                        shadeIntensity: 1,
                        opacityFrom: 0.7,
                        opacityTo: 0.2,
                        stops: [0, 100],
                      },
                    },
                    markers: {
                      size: 4,
                      colors: ["#206bc4"],
                      strokeColors: "#fff",
                      strokeWidth: 2,
                      hover: {
                        size: 6,
                      },
                    },
                    xaxis: {
                      type: "category",
                      labels: {
                        show: true,
                        rotate: -45,
                        rotateAlways: false,
                        hideOverlappingLabels: true,
                        trim: true,
                        style: {
                          fontFamily: "inherit",
                          colors: "var(--tblr-gray-500)",
                        },
                      },
                      tickPlacement: "on",
                      axisBorder: { show: false },
                      axisTicks: { show: false },
                      categories: chartLabels,
                    },
                    yaxis: {
                      labels: {
                        show: true,
                        formatter: (value) => formatCurrency(value),
                        style: {
                          fontFamily: "inherit",
                          colors: "var(--tblr-gray-500)",
                        },
                      },
                      tickAmount: 5,
                    },
                    grid: {
                      strokeDashArray: 4,
                      padding: {
                        top: 0,
                        right: 10,
                        bottom: 10,
                        left: 10,
                      },
                    },
                    tooltip: {
                      enabled: true,
                      theme: currentTheme,
                      x: {
                        show: true,
                      },
                      y: {
                        formatter: (value) => formatCurrency(value),
                      },
                      marker: {
                        show: true,
                      },
                      custom: ({ series, seriesIndex, dataPointIndex, w }) => {
                        const value = series[seriesIndex][dataPointIndex];
                        const label = w.globals.labels[dataPointIndex];

                        return `
                          <div class="apexcharts-tooltip-box"">
                            <div class="apexcharts-tooltip-value" style="display: flex; align-items: center;">
                              <span class="text-primary me-1">●</span> Przychód: <strong class="ms-1">${formatCurrency(value)}</strong>
                            </div>
                          </div>
                        `;
                      },
                    },
                    colors: ["#206bc4"],
                  }}
                  series={[
                    {
                      name: "Przychód",
                      data: chartData,
                    },
                  ]}
                  type="area"
                  height={320}
                />
              ) : (
                <div className="d-flex justify-content-center align-items-center h-100">
                  <p className="text-muted">Brak danych dla wybranego okresu</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const getPeriodName = (period) => {
  switch (period) {
    case "day":
      return "dzienny";
    case "week":
      return "tygodniowy";
    case "month":
      return "miesięczny";
    case "quarter":
      return "kwartalny";
    default:
      return "miesięczny";
  }
};

export default RevenueChart;
