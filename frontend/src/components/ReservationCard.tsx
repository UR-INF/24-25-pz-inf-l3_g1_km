import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import ApexChart from "react-apexcharts";
import { useTheme } from "../contexts/theme";

const ReservationCard = () => {
  const [reservationsCount, setReservationsCount] = useState(0);
  const [difference, setDifference] = useState(0);
  const [trendData, setTrendData] = useState<number[]>([]);
  const [trendLabels, setTrendLabels] = useState<string[]>([]);
  const [selectedRange, setSelectedRange] = useState("7");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReservationsData = async () => {
      try {
        const response = await api.get("/reservations");
        const reservations = response.data;

        const now = new Date();
        const currentFrom = new Date();
        currentFrom.setDate(now.getDate() - parseInt(selectedRange));

        const previousFrom = new Date();
        previousFrom.setDate(now.getDate() - parseInt(selectedRange) * 2);
        const previousTo = new Date(currentFrom);

        const currentPeriod = reservations.filter((r) => {
          const startDate = new Date(r.startDate);
          return startDate >= currentFrom && startDate <= now;
        });
        const previousPeriod = reservations.filter((r) => {
          const startDate = new Date(r.startDate);
          return startDate >= previousFrom && startDate < previousTo;
        });

        const currentCount = currentPeriod.length;
        const previousCount = previousPeriod.length;

        const calculatedDifference =
          previousCount === 0
            ? 100
            : Math.round(((currentCount - previousCount) / previousCount) * 100);

        setReservationsCount(currentCount);
        setDifference(calculatedDifference);

        // Trend dzienny
        const counts: { [date: string]: number } = {};
        for (let i = 0; i < parseInt(selectedRange); i++) {
          const date = new Date();
          date.setDate(now.getDate() - (parseInt(selectedRange) - i - 1));
          const key = date.toISOString().split("T")[0];
          counts[key] = 0;
        }

        currentPeriod.forEach((r) => {
          const date = new Date(r.startDate).toISOString().split("T")[0];
          if (counts[date] !== undefined) {
            counts[date]++;
          }
        });

        const sortedDates = Object.keys(counts).sort();
        const chartSeries = sortedDates.map((date) => ({
          x: new Date(date).getTime(), // timestamp dla datetime
          y: counts[date],
        }));
        setTrendData(chartSeries);
      } catch (err) {
        setError("Wystąpił błąd podczas pobierania danych.");
      } finally {
        setLoading(false);
      }
    };

    fetchReservationsData();
  }, [selectedRange]);

  const handleRangeChange = (range) => {
    setSelectedRange(range);
  };

  const { currentTheme } = useTheme();

  if (loading) return <div>Ładowanie...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="col-sm-6 col-lg-3">
      <div className="card">
        <div className="card-body pb-0">
          <div className="d-flex align-items-center">
            <div className="subheader">Rezerwacje</div>
            <div className="lh-1 ms-auto">
              <div className="dropdown">
                <a className="dropdown-toggle text-secondary" href="#" data-bs-toggle="dropdown">
                  {selectedRange === "7" ? "Ost. 7 dni" : "Ost. 30 dni"}
                </a>
                <div className="dropdown-menu dropdown-menu-end">
                  <a
                    className={`dropdown-item ${selectedRange === "7" ? "active" : ""}`}
                    href="#"
                    onClick={() => handleRangeChange("7")}
                  >
                    Ostatnie 7 dni
                  </a>
                  <a
                    className={`dropdown-item ${selectedRange === "30" ? "active" : ""}`}
                    href="#"
                    onClick={() => handleRangeChange("30")}
                  >
                    Ostatnie 30 dni
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="d-flex align-items-baseline mt-2">
            <div className="h1 mb-0 me-2">{reservationsCount}</div>
            <div className="me-auto">
              <span
                className={`d-inline-flex align-items-center lh-1 ${
                  difference >= 0 ? "text-green" : "text-red"
                }`}
              >
                {difference}%
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="icon ms-1 icon-2"
                  style={{ transform: difference < 0 ? "rotate(180deg)" : "none" }}
                >
                  <path d="M3 17l6 -6l4 4l8 -8" />
                  <path d="M14 7l7 0l0 7" />
                </svg>
              </span>
            </div>
          </div>
        </div>
        <div className="mt-2" style={{ height: 30 }}>
          <ApexChart
            type="area"
            height="100%"
            width="100%"
            options={{
              chart: {
                type: "area",
                sparkline: { enabled: true },
                animations: { enabled: false },
                toolbar: { show: false },
              },
              stroke: {
                curve: "smooth",
                width: 2,
              },
              fill: {
                type: "solid",
                opacity: 0.16,
              },
              tooltip: {
                theme: currentTheme,
                x: {
                  formatter: (value) => {
                    try {
                      const date = new Date(value);
                      return new Intl.DateTimeFormat("pl-PL", {
                        day: "2-digit",
                        month: "short",
                      }).format(date);
                    } catch {
                      return value;
                    }
                  },
                },
                y: {
                  formatter: (value) => `${value}`,
                },
              },
              grid: {
                show: false,
                padding: { top: 0, left: 0, right: 0, bottom: 0 },
              },
              xaxis: {
                type: "datetime",
                labels: { show: false },
                tooltip: { enabled: false },
              },
              yaxis: {
                show: false,
              },
              colors: ["#206bc4"],
            }}
            series={[
              {
                name: "Rezerwacje",
                data: trendData,
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
};

export default ReservationCard;
