import React, { useState } from "react";

const RoomsCard = () => {
  return (
    <div className="col-sm-6 col-lg-3">
      <div className="card">
        <div className="card-body">
          <div className="d-flex align-items-center">
            <div className="subheader">Zajęte pokoje</div>
          </div>
          <div className="h1 mb-3">84</div>
          <div className="d-flex mb-2">
            <div>
              <span className="text-muted">Dostepne pokoje</span>
            </div>
            <div className="ms-auto">
              <span className="text-green d-inline-flex align-items-center lh-1">46</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomsCard;
