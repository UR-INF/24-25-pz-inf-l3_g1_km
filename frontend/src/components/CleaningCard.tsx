import React, { useState } from "react";

const CleaningCard = () => {
  return (
    <div className="col-sm-6 col-lg-3">
      <div className="card">
        <div className="card-body">
          <div className="d-flex align-items-center">
            <div className="subheader">Otwarte zgłoszenia sprzątania</div>
          </div>
          <div className="h1 mb-3">50</div>
          <div className="d-flex mb-2">
            <div>
              <a href="" className="btn btn-primary" target="_blank" rel="noopener">
                Zobacz
              </a>
            </div>
            <div className="ms-auto"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CleaningCard;
