
import React, { useState, useMemo } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from './icons';

interface CalendarProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (value: string) => void;
  mode: 'date' | 'month';
  currentValue?: string;
}

const Calendar: React.FC<CalendarProps> = ({ isOpen, onClose, onSelect, mode, currentValue }) => {
  const getInitialDate = (): Date => {
    if (!currentValue) return new Date();
    // For 'month' mode, currentValue is in YYYY-MM format
    if (mode === 'month') {
      const [year, month] = currentValue.split('-').map(Number);
      return new Date(year, month - 1, 1);
    }
    // For 'date' mode, currentValue is in YYYY-MM-DD format
    return new Date(currentValue);
  };
  const initialDate = getInitialDate();

  const [displayDate, setDisplayDate] = useState(initialDate);
  const [view, setView] = useState<'days' | 'months' | 'years'>(mode === 'month' ? 'months' : 'days');

  const selectedDate = useMemo(() => {
    if (!currentValue) return null;
    // For month mode, currentValue is in YYYY-MM format
    if (mode === 'month') {
      const [year, month] = currentValue.split('-').map(Number);
      return new Date(year, month - 1, 1);
    }
    // For date mode, currentValue is in YYYY-MM-DD format
    const d = new Date(currentValue);
    // Adjust for timezone offset to get correct YYYY-MM-DD
    d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
    return d;
  }, [currentValue, mode]);

  const daysInMonth = useMemo(() => {
    const date = new Date(displayDate.getFullYear(), displayDate.getMonth(), 1);
    const days = [];
    // Previous month's days
    const firstDayIndex = date.getDay();
    const prevLastDay = new Date(displayDate.getFullYear(), displayDate.getMonth(), 0).getDate();
    for (let x = firstDayIndex; x > 0; x--) {
      days.push({ day: prevLastDay - x + 1, isCurrentMonth: false });
    }
    // Current month's days
    const lastDayIndex = new Date(displayDate.getFullYear(), displayDate.getMonth() + 1, 0).getDate();
    for (let i = 1; i <= lastDayIndex; i++) {
      days.push({ day: i, isCurrentMonth: true });
    }
    // Next month's days
    const nextDays = 42 - days.length; // 6 weeks * 7 days
    for (let j = 1; j <= nextDays; j++) {
        days.push({day: j, isCurrentMonth: false});
    }
    return days;
  }, [displayDate]);

  const months = useMemo(() => ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], []);
  const years = useMemo(() => {
    const startYear = displayDate.getFullYear() - 5;
    return Array.from({ length: 12 }, (_, i) => startYear + i);
  }, [displayDate]);

  const handleDateSelect = (day: number) => {
    const newDate = new Date(displayDate.getFullYear(), displayDate.getMonth(), day);
    onSelect(newDate.toISOString().split('T')[0]);
    onClose();
  };

  const handleMonthSelect = (monthIndex: number) => {
    if (mode === 'month') {
      const newDate = new Date(displayDate.getFullYear(), monthIndex, 1);
      onSelect(newDate.toISOString().substring(0, 7));
      onClose();
    } else {
      setDisplayDate(new Date(displayDate.getFullYear(), monthIndex, 1));
      setView('days');
    }
  };

  const handleYearSelect = (year: number) => {
    setDisplayDate(new Date(year, displayDate.getMonth(), 1));
    setView('months');
  };

  const changeMonth = (offset: number) => {
    setDisplayDate(prev => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
  };
  
  const changeYear = (offset: number) => {
     setDisplayDate(prev => new Date(prev.getFullYear() + offset, prev.getMonth(), 1));
  };

  const changeYearRange = (offset: number) => {
    setDisplayDate(prev => new Date(prev.getFullYear() + offset * 12, prev.getMonth(), 1));
  };

  const renderHeader = () => {
    switch (view) {
      case 'days':
        return (
          <>
            <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"><ChevronLeftIcon className="w-5 h-5"/></button>
            <button onClick={() => setView('months')} className="flex-1 text-center font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md py-1 transition-colors text-light-text-primary dark:text-dark-text-primary">{displayDate.toLocaleString('default', { month: 'long' })} {displayDate.getFullYear()}</button>
            <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"><ChevronRightIcon className="w-5 h-5"/></button>
          </>
        );
      case 'months':
        return (
          <>
            <button onClick={() => changeYear(-1)} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"><ChevronLeftIcon className="w-5 h-5"/></button>
            <button onClick={() => setView('years')} className="flex-1 text-center font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md py-1 transition-colors text-light-text-primary dark:text-dark-text-primary">{displayDate.getFullYear()}</button>
            <button onClick={() => changeYear(1)} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"><ChevronRightIcon className="w-5 h-5"/></button>
          </>
        );
      case 'years':
        return (
           <>
            <button onClick={() => changeYearRange(-1)} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"><ChevronLeftIcon className="w-5 h-5"/></button>
            <div className="flex-1 text-center font-semibold py-1 text-light-text-primary dark:text-dark-text-primary">{years[0]} - {years[years.length - 1]}</div>
            <button onClick={() => changeYearRange(1)} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"><ChevronRightIcon className="w-5 h-5"/></button>
          </>
        )
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-3 sm:p-4 modal-backdrop animate-fade-in" onClick={onClose}>
      <div className="bg-light-card dark:bg-dark-card rounded-2xl w-full max-w-xs shadow-2xl text-light-text-primary dark:text-dark-text-primary p-3 sm:p-4 animate-scale-in glass textured-card" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          {renderHeader()}
        </div>
        <div className="grid grid-cols-7 gap-1 text-center">
            {view === 'days' && <>
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => <div key={d} className="text-xs font-bold text-light-text-secondary dark:text-dark-text-secondary py-2">{d}</div>)}
                {daysInMonth.map(({ day, isCurrentMonth }, index) => {
                    const isSelected = selectedDate && isCurrentMonth && day === selectedDate.getDate() && displayDate.getMonth() === selectedDate.getMonth() && displayDate.getFullYear() === selectedDate.getFullYear();
                    return (
                        <button 
                            key={index}
                            onClick={() => isCurrentMonth && handleDateSelect(day)}
                            className={`w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full text-xs sm:text-sm transition-all duration-200 ${
                                !isCurrentMonth 
                                    ? 'text-slate-400 dark:text-slate-600' 
                                    : 'text-light-text-primary dark:text-dark-text-primary hover:bg-slate-200 dark:hover:bg-slate-700 hover:scale-110 active:scale-95'
                            } ${isSelected ? 'bg-primary text-white font-bold shadow-lg scale-110' : ''}`}
                            disabled={!isCurrentMonth}
                        >
                            {day}
                        </button>
                    );
                })}
            </>}
        </div>
        <div className="grid grid-cols-3 gap-2 text-center mt-4">
             {view === 'months' && months.map((month, index) => {
                const isSelected = mode === 'month' && selectedDate && displayDate.getMonth() === index && displayDate.getFullYear() === selectedDate.getFullYear();
                return (
                    <button
                        key={month}
                        onClick={() => handleMonthSelect(index)}
                        className={`p-3 rounded-lg transition-all duration-200 hover:bg-slate-200 dark:hover:bg-slate-700 hover:scale-105 ${
                            isSelected ? 'bg-primary text-white font-bold shadow-lg' : 'text-light-text-primary dark:text-dark-text-primary'
                        }`}
                    >
                        {month}
                    </button>
                );
            })}
        </div>
        <div className="grid grid-cols-3 gap-2 text-center mt-4">
             {view === 'years' && years.map((year) => {
                const isSelected = selectedDate && displayDate.getFullYear() === year;
                return (
                    <button
                        key={year}
                        onClick={() => handleYearSelect(year)}
                        className={`p-3 rounded-lg transition-all duration-200 hover:bg-slate-200 dark:hover:bg-slate-700 hover:scale-105 ${
                            isSelected ? 'bg-primary text-white font-bold shadow-lg' : 'text-light-text-primary dark:text-dark-text-primary'
                        }`}
                    >
                        {year}
                    </button>
                );
            })}
        </div>
      </div>
    </div>
  );
};

export default Calendar;
