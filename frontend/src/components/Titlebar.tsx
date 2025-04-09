import React, { useState } from "react";

const Titlebar = () => {
	const handleMinimize = () => window.ipcRenderer.send("window:minimize");
	const handleMaximize = () => window.ipcRenderer.send("window:maximize");
	const handleClose = () => window.ipcRenderer.send("window:close");

	const [theme, setTheme] = useState<"light" | "dark">(
		document.documentElement.dataset.theme === "dark" ? "dark" : "light"
	);

	const toggleTheme = () => {
		const newTheme = theme === "light" ? "dark" : "light";
		document.documentElement.setAttribute("data-bs-theme", newTheme);
		setTheme(newTheme);
	};

	return (
		<header
			className="navbar navbar-expand-md d-print-none"
			style={{ WebkitAppRegion: "drag" } as React.CSSProperties}>
			<div className="container-xl">
				<div className="navbar-brand navbar-brand-autodark d-none-navbar-horizontal px-1">
					<i
						className="ti ti-building-skyscraper fs-1"
						style={{
							backgroundColor: "var(--tblr-primary, #066fd1)",
							color: "var(--tblr-body-bg)",
							fontSize: "20px",
							borderRadius: "8px",
							padding: "4px",
							boxShadow: "0 0 0 1px rgba(0,0,0,0.05)",
						}}></i>
					<a href="/" className="text-decoration-none text-reset">
						Hotel Task Manager
					</a>
				</div>

				<ul
					className="navbar-nav flex-row order-md-last"
					style={
						{ WebkitAppRegion: "no-drag" } as React.CSSProperties
					}>
					<li className="nav-item">
						<button
							className="nav-link px-1 btn btn-link"
							title={`Przełącz na ${
								theme === "dark" ? "jasny" : "ciemny"
							} motyw`}
							onClick={toggleTheme}>
							<i
								className={`fs-2 ti ti-${
									theme === "dark" ? "sun" : "moon"
								}`}></i>
						</button>
					</li>

					<li className="nav-item">
						<button
							onClick={() =>
								window.ipcRenderer.send("window:devtools")
							}
							className="nav-link px-1 btn btn-link"
							title="Otwórz narzędzia deweloperskie">
							<i className="ti ti-settings fs-2"></i>
						</button>
					</li>

					<li className="nav-item">
						<button
							onClick={handleMinimize}
							className="nav-link px-1 btn btn-link"
							title="Zminimalizuj okno">
							<i className="ti ti-minus fs-2"></i>
						</button>
					</li>

					<li className="nav-item">
						<button
							onClick={handleMaximize}
							className="nav-link px-1 btn btn-link"
							title="Zmaksymalizuj okno">
							<i className="ti ti-square fs-2"></i>
						</button>
					</li>

					<li className="nav-item">
						<button
							onClick={handleClose}
							className="nav-link px-1 btn btn-link text-danger"
							title="Zamknij okno">
							<i className="ti ti-x fs-2"></i>
						</button>
					</li>
				</ul>
			</div>
		</header>
	);
};

export default Titlebar;
