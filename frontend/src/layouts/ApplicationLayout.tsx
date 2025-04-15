import Titlebar from "../components/Titlebar";
import { Outlet } from "react-router";

const ApplicationLayout = () => {
  return (
    <>
      <Titlebar />
      <div>
        <Outlet />
      </div>
    </>
  );
};

export default ApplicationLayout;
