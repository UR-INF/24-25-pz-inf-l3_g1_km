import { useEffect, useState } from "react";
import ApexChart from "react-apexcharts";
import dayjs from "dayjs";
import { api } from "../services/api";
import { useTheme } from "../contexts/theme";

const ReservationsPlot = () => {
  const [chartData, setChartData] = useState<number[]>([]);
  const [chartLabels, setChartLabels] = useState<string[]>([]);
  const [radialValue, setRadialValue] = useState<number>(0);
  const { currentTheme } = useTheme();

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const res = await api.get("/reservations");
        const reservations = res.data;

        const today = dayjs();
        const last7Days = Array.from({ length: 7 }).map((_, i) =>
          today.subtract(6 - i, "day").startOf("day"),
        );

        const dailyCounts = last7Days.map((day) => {
          return reservations.filter((r: any) => dayjs(r.startDate).isSame(day, "day")).length;
        });

        const total = dailyCounts.reduce((a, b) => a + b, 0);
        const avg = total > 0 ? Math.round((dailyCounts[6] / total) * 100) : 0;

        setChartLabels(last7Days.map((d) => d.format("YYYY-MM-DD")));
        setChartData(dailyCounts);
        setRadialValue(avg);
      } catch (err) {
        console.error("Błąd podczas pobierania rezerwacji:", err);
      }
    };

    fetchReservations();
  }, []);

  const maxChartValue = Math.max(...chartData) + 1;

  return (
    <div className="card">
      <div className="card-header border-0">
        <div className="card-title">Rezerwacje – ostatnie 7 dni</div>
      </div>
      <div className="position-relative">
        <div className="position-absolute top-0 left-0 px-3 mt-1 w-75">
          <div className="row g-2">
            <div className="col-auto">
              <div className="chart-sparkline chart-sparkline-square" style={{ minHeight: "41px" }}>
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
                    colors: ["#206bc4"],
                  }}
                  series={[radialValue]}
                  type="radialBar"
                  height={40}
                  width={40}
                />
              </div>
            </div>
            <div className="col">
              <div>Liczba zarezerwowanych pokoi: {chartData.reduce((a, b) => a + b, 0)}</div>
              <div className="text-secondary">
                {radialValue > 0
                  ? `Dziś to ${radialValue}% z ostatnich 7 dni`
                  : "Brak danych z dziś"}
              </div>
            </div>
          </div>
        </div>

        <div id="chart-development-activity" style={{ minHeight: "192px" }}>
          <ApexChart
            options={{
              chart: {
                type: "area",
                height: 192,
                sparkline: { enabled: true },
              },
              dataLabels: { enabled: false },
              fill: { opacity: 0.16, type: "solid" },
              stroke: { width: 2, curve: "smooth", lineCap: "round" },
              xaxis: {
                type: "datetime",
                labels: { show: false },
                axisBorder: { show: false },
                tooltip: { enabled: false },
              },
              yaxis: { labels: { show: false }, max: maxChartValue },
              grid: { strokeDashArray: 4 },
              tooltip: { theme: currentTheme },
              colors: ["#206bc4"],
              labels: chartLabels,
            }}
            series={[{ name: "Rezerwacje", data: chartData }]}
            type="area"
            height={192}
          />
        </div>
      </div>
    </div>
  );
};

export default ReservationsPlot;
