import React, { useState } from "react";
import { useNavigationHistory } from "../hooks/useNavigationHistory";
import { useTheme } from "../contexts/theme";
import AdminConfigModal from "./AdminConfigModal";

const Titlebar = () => {
  const handleMinimize = () => window.ipcRenderer.send("window:minimize");
  const handleMaximize = () => window.ipcRenderer.send("window:maximize");
  const handleClose = () => window.ipcRenderer.send("window:close");

  const { currentTheme, toggleTheme } = useTheme();

  const { goBack, goForward, canGoBack, canGoForward } = useNavigationHistory();
  const [adminVisible, setAdminVisible] = useState(false);

  return (
    <header
      className="navbar navbar-expand-md"
      style={{ WebkitAppRegion: "drag" } as React.CSSProperties}
    >
      <div
        className="container-xl d-grid"
        style={{
          gridTemplateColumns: "1fr auto 1fr",
          alignItems: "center",
        }}
      >
        <div
          className="d-flex w-100 justify-content-start"
          style={{ WebkitAppRegion: "drag" } as React.CSSProperties}
        >
          <ul
            className="navbar-nav d-flex flex-row w-auto align-items-center gap-1"
            style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
          >
            <li className="nav-item">
              <button
                onClick={goBack}
                className="nav-link px-0 btn btn-link"
                style={{
                  cursor: canGoBack ? "pointer" : "not-allowed",
                  opacity: canGoBack ? 1 : 0.4,
                }}
                title="Wstecz"
                disabled={!canGoBack}
              >
                <i className="ti ti-chevron-left fs-2"></i>
              </button>
            </li>

            <li className="nav-item">
              <button
                onClick={goForward}
                className="nav-link px-0 btn btn-link"
                style={{
                  cursor: canGoForward ? "pointer" : "not-allowed",
                  opacity: canGoForward ? 1 : 0.4,
                }}
                title="Naprzód"
                disabled={!canGoForward}
              >
                <i className="ti ti-chevron-right fs-2"></i>
              </button>
            </li>
          </ul>
        </div>

        <div className="navbar-brand d-flex align-items-center justify-content-center gap-2">
          <img
            src={new URL("../../public/hotel.png", import.meta.url).toString()}
            alt="Logo"
            style={{
              backgroundColor: "var(--tblr-body-bg)",
              borderRadius: "8px",
              padding: "4px",
              boxShadow: "0 0 0 1px rgba(0,0,0,0.05)",
              width: "32px",
              height: "32px",
              objectFit: "contain",
            }}
          />
          <span className="fw-bold text-reset text-decoration-none">Hotel Task Manager</span>
        </div>

        <div
          className="d-flex w-100 justify-content-end"
          style={{ WebkitAppRegion: "drag" } as React.CSSProperties}
        >
          <ul
            className="navbar-nav d-flex flex-row w-auto align-items-center gap-1"
            style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
          >
            <li className="nav-item">
              <button
                className="nav-link px-1 btn btn-link"
                title={`Przełącz na ${currentTheme === "dark" ? "jasny" : "ciemny"} motyw`}
                onClick={toggleTheme}
              >
                <i className={`fs-2 ti ti-${currentTheme === "dark" ? "sun" : "moon"}`}></i>
              </button>
            </li>

            <li className="nav-item">
              <button
                onClick={() => window.ipcRenderer.send("window:devtools")}
                className="nav-link px-1 btn btn-link"
                title="Otwórz narzędzia deweloperskie"
              >
                <i className="ti ti-code fs-2"></i>
              </button>
            </li>

            <li className="nav-item">
              <button
                onClick={() => setAdminVisible(true)}
                className="nav-link px-1 btn btn-link text-danger"
                title="Otwórz panel administracyjny"
              >
                <i className="ti ti-settings fs-2"></i>
              </button>
            </li>

            <li className="nav-item">
              <button
                onClick={handleMinimize}
                className="nav-link px-1 btn btn-link"
                title="Zminimalizuj okno"
              >
                <i className="ti ti-minus fs-2"></i>
              </button>
            </li>

            <li className="nav-item">
              <button
                onClick={handleMaximize}
                className="nav-link px-1 btn btn-link"
                title="Zmaksymalizuj okno"
              >
                <i className="ti ti-square fs-2"></i>
              </button>
            </li>

            <li className="nav-item">
              <button
                onClick={handleClose}
                className="nav-link px-1 btn btn-link text-danger"
                title="Zamknij okno"
              >
                <i className="ti ti-x fs-2"></i>
              </button>
            </li>
          </ul>
        </div>
      </div>

      <AdminConfigModal show={adminVisible} onClose={() => setAdminVisible(false)} />
    </header>
  );
};

export default Titlebar;
