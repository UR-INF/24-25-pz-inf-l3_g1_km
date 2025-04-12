import React, { useState } from "react";

const HeaderNav = () => {
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

  return (
    <header className="navbar-expand-md">
        <div className="collapse navbar-collapse" id="navbar-menu">
          <div className="navbar">
            <div className="container-xl">
              <div className="row flex-fill align-items-center">
                <div className="col">

                  <ul className="navbar-nav">
                    <li className="nav-item active">
                      <a className="nav-link" href="./">
                        <span className="nav-link-icon d-md-none d-lg-inline-block">

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
                            className="icon icon-1"
                          >
                            <path d="M5 12l-2 0l9 -9l9 9l-2 0" />
                            <path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-7" />
                            <path d="M9 21v-6a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v6" />
                          </svg>
                        </span>
                        <span className="nav-link-title"> Dashboard </span>
                      </a>
                    </li>
                    <li className="nav-item">
                      <a className="nav-link" href="./form-elements.html">
                        <span className="nav-link-title"> Rezerwacje </span>
                      </a>
                    </li>
                    <li className="nav-item dropdown">
                      <a
                        className="nav-link dropdown-toggle"
                        href="#navbar-extra"
                        data-bs-toggle="dropdown"
                        data-bs-auto-close="outside"
                        role="button"
                        aria-expanded="false"
                      >
                        <span className="nav-link-title"> Zgłoszenia </span>
                      </a>
                      <div className="dropdown-menu">
                        <div className="dropdown-menu-columns">
                          <div className="dropdown-menu-column">
                            <a className="dropdown-item" href="./activity.html"> Zgłoszenia sprzątania </a>
                            <a className="dropdown-item" href="./chat.html"> Zgłoszenia naprawy </a>
                          </div>
                        </div>
                      </div>
                    </li>
                    <li></li>
                  </ul>
                </div>
              </div>
              <div className="nav-item dropdown">
          <a href="#" className="nav-link d-flex lh-1 p-0 px-2" data-bs-toggle="dropdown" aria-label="Open user menu">
            <div className="d-none d-xl-block ps-2">
              <div>Dawid Wojcik</div>
              <div className="mt-1 small text-secondary">RECEPTIONIST</div>
            </div>
          </a>
          <div className="dropdown-menu dropdown-menu-end dropdown-menu-arrow">
            <a href="#" className="dropdown-item">Status</a>
            <a href="./profile.html" className="dropdown-item">Profile</a>
            <a href="#" className="dropdown-item">Feedback</a>
            <div className="dropdown-divider"></div>
            <a href="./settings.html" className="dropdown-item">Settings</a>
            <a href="./sign-in.html" className="dropdown-item">Logout</a>
          </div>
        </div>
            </div>
          </div>
        </div>
      </header>
  );
};

export default HeaderNav;
