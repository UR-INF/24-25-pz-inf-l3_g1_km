import React, { useState } from "react";

const ReservationCard = () => {

  return (
    <div className="col-sm-6 col-lg-3">
                <div className="card">
                  <div className="card-body">
                    <div className="d-flex align-items-center">
                      <div className="subheader">Rezerwacje</div>
                      <div className="ms-auto lh-1">
                        <div className="dropdown">
                          <a className="dropdown-toggle text-secondary" href="#" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">Ostatnie 7 dni</a>
                          <div className="dropdown-menu dropdown-menu-end">
                            <a className="dropdown-item active" href="#">Ostatnie 7 dni</a>
                            <a className="dropdown-item" href="#">Ostatnie 30 dni</a>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="h1 mb-3">75</div>
                    <div className="d-flex mb-2">
                      <div>
                        <span className="text-muted">Różnica</span>
                      </div>
                      <div className="ms-auto">
                        <span className="text-green d-inline-flex align-items-center lh-1">
                          7%
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="icon ms-1 icon-2">
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
