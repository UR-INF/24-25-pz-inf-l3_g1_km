import React, { useState } from "react";
import StaffPerformanceCard from "../../components/StaffPerformanceCard";
import StaffPerformanceTable from "../../components/StaffPerformanceTable";
import RoomStatusCard from "../../components/RoomStatusCard";
import RoomStatusTable from "../../components/RoomStatusTable";
import RevenueChart from "../../components/RevenueChart";
import FinancialReportTable from "../../components/FinancialReportTable";
import MaintenanceIssuesTable from "../../components/MaintenanceIssuesTable";
import ReportsTable from "../../components/ReportsTable";

// Definicja dla typów zakładek
type TabType = "employees" | "cleaning" | "maintenance" | "finance" | "report-files";

const ReportsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>("employees");

  // Funkcja obsługująca zmianę zakładki
  const handleTabChange = (tabName: TabType) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setActiveTab(tabName);
  };

  // Renderowanie zawartości na podstawie aktywnej zakładki
  const renderTabContent = () => {
    switch (activeTab) {
      case "employees":
        return (
          <>
            <StaffPerformanceCard />
            <div className="mt-3"></div>
            <StaffPerformanceTable />
          </>
        );
      case "cleaning":
        return (
          <>
            <RoomStatusCard />
            <div className="mt-3"></div>
            <RoomStatusTable />
          </>
        );
      case "maintenance":
        return (
          <>
            <MaintenanceIssuesTable />
            <div className="mt-3"></div>
          </>
        );
      case "finance":
        return (
          <>
            <RevenueChart />
            <div className="mt-3"></div>
            <FinancialReportTable />
          </>
        );
      case "report-files":
        return (
          <>
            <ReportsTable />
            <div className="mt-3"></div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div className="container-xl">
          <div className="row g-2 align-items-center">
            <div className="col">
              <h1 className="page-title">Raporty</h1>
            </div>
          </div>
          <ul className="nav nav-bordered mb-4">
            <li className="nav-item">
              <a
                className={`nav-link ${activeTab === "employees" ? "active" : ""}`}
                href="#"
                onClick={handleTabChange("employees")}
              >
                Pracownicy
              </a>
            </li>
            <li className="nav-item">
              <a
                className={`nav-link ${activeTab === "cleaning" ? "active" : ""}`}
                href="#"
                onClick={handleTabChange("cleaning")}
              >
                Pokoje
              </a>
            </li>
            <li className="nav-item">
              <a
                className={`nav-link ${activeTab === "maintenance" ? "active" : ""}`}
                href="#"
                onClick={handleTabChange("maintenance")}
              >
                Zlecenia
              </a>
            </li>
            <li className="nav-item">
              <a
                className={`nav-link ${activeTab === "finance" ? "active" : ""}`}
                href="#"
                onClick={handleTabChange("finance")}
              >
                Finanse
              </a>
            </li>
            <li className="nav-item">
              <a
                className={`nav-link ${activeTab === "report-files" ? "active" : ""}`}
                href="#"
                onClick={handleTabChange("report-files")}
              >
                Historia raportów
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="page-body">
        <div className="container-xl">{renderTabContent()}</div>
      </div>
    </div>
  );
};

export default ReportsView;
