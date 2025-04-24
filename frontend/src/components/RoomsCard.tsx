import React, { useState, useEffect } from "react";
import { api } from "../services/api";

const RoomsCard = () => {
  const [occupiedCount, setOccupiedCount] = useState(0);
  const [availableCount, setAvailableCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRoomStatus = async () => {
      try {
        const [occupiedRes, availableRes] = await Promise.all([
          api.get("/rooms/status/OCCUPIED"),
          api.get("/rooms/status/AVAILABLE"),
        ]);

        setOccupiedCount(occupiedRes.data.length);
        setAvailableCount(availableRes.data.length);
        setLoading(false);
      } catch (err) {
        setError("Nie udało się pobrać danych o pokojach.");
        setLoading(false);
      }
    };

    fetchRoomStatus();
  }, []);

  if (loading) return <div>Ładowanie...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="col-sm-6 col-lg-3">
      <div className="card">
        <div className="card-body">
          <div className="d-flex align-items-center">
            <div className="subheader">Zajęte pokoje</div>
          </div>
          <div className="h1 mb-3">{occupiedCount}</div>
          <div className="d-flex mb-2">
            <div>
              <span className="text-muted">Dostepne pokoje</span>
            </div>
            <div className="ms-auto">
              <span className="text-green d-inline-flex align-items-center lh-1">
                {availableCount}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomsCard;
