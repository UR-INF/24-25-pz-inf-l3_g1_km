import React from "react";
import Titlebar from "../components/Titlebar";

const MainLayout = ({ children }: { children: React.ReactNode }) => {
	return (
		<>
			<Titlebar />
			<div>{children}</div>
		</>
	);
};

export default MainLayout;
