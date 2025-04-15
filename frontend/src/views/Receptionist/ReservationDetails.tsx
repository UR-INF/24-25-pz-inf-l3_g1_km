import React, { useState } from "react";
import ModifyReservation from "../../components/ModifyReservation";
import { useLocation } from "react-router";

const ReservationsDetails = () => {
  const location = useLocation();
  const reservationId = location.state?.reservationId ?? 1;
  
  return (
    <div className="page-wrapper">
      <div className="page-body">
        <div className="container-xl">
          <div className="card">
            <ModifyReservation reservationId={reservationId}/>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReservationsDetails;
