import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

interface SidebarProps {
    isOpen: boolean;
    onToggle: () => void;
}

function Sidebar({ isOpen, onToggle }: SidebarProps) {
    const location = useLocation();
    const [hoveredItem, setHoveredItem] = useState<string | null>(null);

    const menuItems = [
        { 
            name: "Dashboard", 
            path: "/", 
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
            )
        },
        { 
            name: "Users", 
            path: "/users", 
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5 0a4 4 0 11-8-4 4 4 0 018 4z" />
                </svg>
            )
        },
        { 
            name: "Web Scraping", 
            path: "/web", 
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s1.343-9 3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 919-9" />
                </svg>
            )
        }
    ];

    const isActive = (path: string) => {
        return location.pathname === path;
    };

    return (
        <>
            {/* Mobile overlay */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                    onClick={onToggle}
                />
            )}

            {/* Sidebar */}
            <div className={`fixed left-0 top-0 h-full bg-slate-900 shadow-xl z-50 transition-all duration-300 ease-in-out ${
                isOpen ? 'w-64' : 'w-16'
            } lg:relative lg:translate-x-0 ${
                isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
            }`}>
                
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-700">
                    <div className={`flex items-center space-x-3 transition-opacity duration-200 ${
                        isOpen ? 'opacity-100' : 'opacity-0 lg:opacity-0'
                    }`}>
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-lg font-semibold text-white">Admin Panel</h1>
                        </div>
                    </div>
                    
                    <button
                        onClick={onToggle}
                        className="p-2 rounded-lg hover:bg-slate-800 transition-colors"
                    >
                        <svg className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${
                            isOpen ? 'rotate-180' : ''
                        }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                        </svg>
                    </button>
                </div>

                {/* Navigation */}
                <nav className="p-4 space-y-1">
                    {menuItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center px-3 py-3 rounded-lg transition-all duration-200 group relative ${
                                isActive(item.path)
                                    ? 'bg-blue-600 text-white'
                                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                            }`}
                            onMouseEnter={() => setHoveredItem(item.path)}
                            onMouseLeave={() => setHoveredItem(null)}
                        >
                            <div className="flex-shrink-0">
                                {item.icon}
                            </div>
                            
                            <div className={`ml-3 transition-opacity duration-200 ${
                                isOpen ? 'opacity-100' : 'opacity-0'
                            }`}>
                                <div className="font-medium">{item.name}</div>
                            </div>

                            {/* Tooltip for collapsed state */}
                            {!isOpen && (hoveredItem === item.path) && (
                                <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-lg z-50 whitespace-nowrap">
                                    <div className="font-medium">{item.name}</div>
                                    <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 rotate-45"></div>
                                </div>
                            )}
                        </Link>
                    ))}
                </nav>

                {/* Footer */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700">
                    <div className={`flex items-center space-x-3 transition-opacity duration-200 ${
                        isOpen ? 'opacity-100' : 'opacity-0'
                    }`}>
                        <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <div className="text-sm font-medium text-white">Admin</div>
                            <div className="text-xs text-slate-400">Online</div>
                        </div>
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    </div>
                    
                    {!isOpen && (
                        <div className="flex justify-center">
                            <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center">
                                <svg className="w-4 h-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

export default Sidebar;
