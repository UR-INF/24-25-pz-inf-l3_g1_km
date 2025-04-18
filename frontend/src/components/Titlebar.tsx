import React, { useState } from "react";
import { useNavigationHistory } from "../hooks/useNavigationHistory";

const Titlebar = () => {
  const handleMinimize = () => window.ipcRenderer.send("window:minimize");
  const handleMaximize = () => window.ipcRenderer.send("window:maximize");
  const handleClose = () => window.ipcRenderer.send("window:close");

  const [theme, setTheme] = useState<"light" | "dark">(
    document.documentElement.dataset.theme === "dark" ? "dark" : "light",
  );

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    document.documentElement.setAttribute("data-bs-theme", newTheme);
    setTheme(newTheme);
  };

  const { goBack, goForward, canGoBack, canGoForward } = useNavigationHistory();

  return (
    <header
      className="navbar navbar-expand-md d-print-none"
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
          <i
            className="ti ti-building-skyscraper fs-1"
            style={{
              backgroundColor: "var(--tblr-primary, #066fd1)",
              color: "var(--tblr-body-bg)",
              fontSize: "20px",
              borderRadius: "8px",
              padding: "4px",
              boxShadow: "0 0 0 1px rgba(0,0,0,0.05)",
            }}
          ></i>
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
                title={`Przełącz na ${theme === "dark" ? "jasny" : "ciemny"} motyw`}
                onClick={toggleTheme}
              >
                <i className={`fs-2 ti ti-${theme === "dark" ? "sun" : "moon"}`}></i>
              </button>
            </li>

            <li className="nav-item">
              <button
                onClick={() => window.ipcRenderer.send("window:devtools")}
                className="nav-link px-1 btn btn-link"
                title="Otwórz narzędzia deweloperskie"
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
    </header>
  );
};

export default Titlebar;
