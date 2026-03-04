import { Outlet, Link } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';

export default function Layout() {
    return (
        <div className="flex flex-col h-screen overflow-hidden bg-neutral-50">
            <header className="h-auto min-h-[4rem] py-1.5 bg-white border-b border-neutral-200 flex flex-col md:flex-row items-center px-4 lg:px-6 shrink-0 gap-4">
                <Link to="/" className="flex items-center gap-3 shrink-0 hover:opacity-80 transition-opacity">
                    <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center shadow-sm">
                        <div id="header-logo-portal" className="flex items-center justify-center">
                            <GraduationCap id="header-logo-default" size={18} className="text-white" />
                        </div>
                    </div>
                    <h1 id="header-title" className="text-xl font-bold text-neutral-900 whitespace-nowrap leading-none">Student CRM</h1>
                </Link>

                {/* Portal target for page-specific header actions */}
                <div id="header-actions" className="flex-1 flex flex-wrap items-center justify-end gap-2 md:gap-3 text-sm leading-none"></div>
            </header>

            {/* Page content */}
            <main className="flex-1 overflow-y-auto p-4 lg:p-8 custom-scrollbar">
                <Outlet />
            </main>
        </div>
    );
}
