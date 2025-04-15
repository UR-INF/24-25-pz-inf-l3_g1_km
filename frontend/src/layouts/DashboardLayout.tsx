import HeaderNav from "../components/HeaderNav";
import { Outlet } from "react-router";

const DashboardLayout = () => {
  return (
    <>
      <HeaderNav />
      <div>
        <Outlet />
      </div>
    </>
  );
};

export default DashboardLayout;
