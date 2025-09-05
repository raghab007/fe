import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

function MainLayout() {
    return (
        <div className="flex flex-col min-h-screen">
            {/* Navbar */}
            <Navbar />

            {/* Main content */}
            <div className="flex-1 bg-gray-50 p-4">
                <Outlet />
            </div>
        </div>
    );
}

export default MainLayout;