import React from 'react';

export default function CalendarHeatmap({ year, month, highlightedDays }) {
    const firstDay = new Date(year, month - 1, 1);
    const daysInMonth = new Date(year, month, 0).getDate();
    const startWeekday = firstDay.getDay(); // 0 = sunday

    const totalCells = Math.ceil((startWeekday + daysInMonth) / 7) * 7;

    return (
        <div className="grid grid-cols-7 gap-1 p-4 bg-white rounded-xl shadow-lg w-fit border border-gray-200">
            {Array.from({ length: totalCells }).map((_, i) => {
                const day = i - startWeekday + 1;
                const isValid = day > 0 && day <= daysInMonth;
                const isHighlighted = highlightedDays.includes(day);
                const base =
                    'w-10 h-10 flex items-center justify-center text-sm font-medium rounded-md';

                return (
                    <div
                        key={i}
                        className={`${base} ${isValid
                                ? isHighlighted
                                    ? 'bg-red-500 text-white'
                                    : 'bg-gray-100 text-gray-800'
                                : ''
                            }`}
                    >
                        {isValid ? day : ''}
                    </div>
                );
            })}
        </div>
    );
}
