import HeaderNav from "../components/HeaderNav";
import Titlebar from "../components/Titlebar";
import { Outlet } from "react-router";

const DashboardLayout = () => {
  return (
    <div className="d-flex flex-column vh-100">
      <div className="sticky-top z-3">
        <Titlebar />
        <HeaderNav />
      </div>
      <div className="flex-grow-1 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
};

export default DashboardLayout;
