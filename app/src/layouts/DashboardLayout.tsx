import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/shell/Sidebar';
import Topbar from '../components/shell/Topbar';
import { useLocation } from 'react-router-dom';

export const DashboardLayout: React.FC = () => {
    const [mobileSidebarOpen, setMobileSidebarOpen] = React.useState(false);
    const location = useLocation();

    React.useEffect(() => {
        setMobileSidebarOpen(false);
    }, [location.pathname]);

    return (
        <div className="flex min-h-screen flex-col bg-slate-50">
            <Topbar onMenuClick={() => setMobileSidebarOpen(true)} />
            <div className="flex min-h-0 flex-1">
                <Sidebar />
                <Sidebar mobile isOpen={mobileSidebarOpen} onClose={() => setMobileSidebarOpen(false)} />
                <main className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;