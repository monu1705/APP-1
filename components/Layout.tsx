import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { ChevronLeftIcon, ChevronRightIcon, SunIcon, MoonIcon, SettingsIcon } from './icons';
import Calendar from './Calendar';

const Layout: React.FC = () => {
    const { theme, toggleTheme, currentDate, changeMonth, calendarConfig, closeCalendar } = useAppContext();
    const navigate = useNavigate();
    const location = useLocation();

    // Helper to determine if we should show the month navigation
    const showMonthNav = location.pathname === '/' || location.pathname === '/history';

    const monthYearFormat = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(currentDate);

    return (
        <div className="min-h-screen bg-base text-primary font-sans relative overflow-x-hidden selection:bg-primary/20">
            {/* Abstract Background & Noise */}
            <div className="fixed inset-0 z-0 pointer-events-none bg-abstract-shapes"></div>
            <div className="bg-noise"></div>

            <div className="max-w-6xl mx-auto relative z-10 min-h-screen flex flex-col">
                {/* Header - Solid & Clean */}
                <header className="flex items-center justify-between px-6 py-6 sticky top-0 z-20 bg-surface/95 backdrop-blur-none border-b border-border shadow-sm transition-all">
                    <div className="flex items-center space-x-4 cursor-pointer" onClick={() => navigate('/')}>
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-primary/20">
                            M
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight text-primary">M-Track</h1>
                    </div>

                    {showMonthNav && (
                        <div className="flex items-center space-x-3 bg-surface-secondary p-1 rounded-lg border border-border">
                            <button onClick={() => changeMonth(-1)} className="p-2 rounded-md hover:bg-white dark:hover:bg-slate-700 shadow-sm transition-all text-secondary hover:text-primary" aria-label="Previous month">
                                <ChevronLeftIcon className="w-4 h-4" />
                            </button>
                            <span className="text-sm font-semibold w-32 text-center select-none text-primary">{monthYearFormat}</span>
                            <button onClick={() => changeMonth(1)} className="p-2 rounded-md hover:bg-white dark:hover:bg-slate-700 shadow-sm transition-all text-secondary hover:text-primary" aria-label="Next month">
                                <ChevronRightIcon className="w-4 h-4" />
                            </button>
                        </div>
                    )}

                    <div className="flex items-center space-x-3">
                        <button onClick={() => navigate('/settings')} className="p-2.5 rounded-xl hover:bg-surface-secondary text-secondary hover:text-primary transition-colors" aria-label="Settings">
                            <SettingsIcon className="w-6 h-6" />
                        </button>
                        <button onClick={toggleTheme} className="p-2.5 rounded-xl hover:bg-surface-secondary text-secondary hover:text-primary transition-colors" aria-label="Toggle theme">
                            {theme === 'light' ? <MoonIcon className="w-6 h-6" /> : <SunIcon className="w-6 h-6" />}
                        </button>
                    </div>
                </header>

                <main className="flex-1 px-6 py-8">
                    <Outlet />
                </main>
            </div>

            {calendarConfig.isOpen && <Calendar {...calendarConfig} onClose={closeCalendar} />}
        </div>
    );
};

export default Layout;
