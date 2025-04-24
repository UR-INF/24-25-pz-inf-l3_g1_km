import React, { useState, useEffect } from "react";
import { api } from "../services/api";

const ReservationCard = () => {

  const [reservationsCount, setReservationsCount] = useState(0);
  const [difference, setDifference] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRange, setSelectedRange] = useState("7");

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
        setLoading(false);
      } catch (error) {
        setError("Wystąpił błąd podczas pobierania danych.");
        setLoading(false);
      }
    };

    fetchReservationsData();
  }, [selectedRange]);

  const handleRangeChange = (range) => {
    setLoading(true);
    setSelectedRange(range);
  };

  if (loading) return <div>Ładowanie...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="col-sm-6 col-lg-3">
      <div className="card">
        <div className="card-body">
          <div className="d-flex align-items-center">
            <div className="subheader">Rezerwacje</div>
            <div className="lh-1 ms-2">
              <div className="dropdown">
                <a
                  className="dropdown-toggle text-secondary"
                  href="#"
                  data-bs-toggle="dropdown"
                  aria-haspopup="true"
                  aria-expanded="false"
                >
                  {selectedRange === "7" ? "Ostatnie 7 dni" : "Ostatnie 30 dni"}
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
          <div className="h1 mb-3">{reservationsCount}</div>
          <div className="d-flex mb-2">
            <div>
              <span className="text-muted">Różnica</span>
            </div>
            <div className="ms-auto">
              <span className={`${
                  difference >= 0 ? "text-green" : "text-red"
                } d-inline-flex align-items-center lh-1`}
              >
                {difference}%
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  className="icon ms-1 icon-2"
                >
                  <path d="M3 17l6 -6l4 4l8 -8"></path>
                  <path d="M14 7l7 0l0 7"></path>
                </svg>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReservationCard;
