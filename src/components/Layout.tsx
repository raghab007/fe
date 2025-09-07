import { Outlet } from "react-router-dom";
import { Link, useLocation } from "react-router-dom";

function Layout() {
    const location = useLocation();

    const isActive = (path: string) => {
        return location.pathname === path;
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navbar */}
            <nav className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                                <h1 className="text-xl font-semibold text-gray-900">UserApp</h1>
                            </div>
                        </div>
                        
                        <div className="flex items-center space-x-8">
                            <Link
                                to="/"
                                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                    isActive("/") 
                                        ? "bg-blue-100 text-blue-700" 
                                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                                }`}
                            >
                                Users
                            </Link>
                            <Link
                                to="/web"
                                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                    isActive("/web") 
                                        ? "bg-blue-100 text-blue-700" 
                                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                                }`}
                            >
                                Web Scraping
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main content */}
            <main className="flex-1">
                <Outlet />
            </main>
        </div>
    );
}

export default Layout;