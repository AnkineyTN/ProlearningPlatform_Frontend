import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

const DynamicCalendar = () => {
    const { t } = useTranslation();
    const [currentDate, setCurrentDate] = useState(new Date());
    const today = new Date();

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const monthNames = [
        t('calendar.months.january'),
        t('calendar.months.february'),
        t('calendar.months.march'),
        t('calendar.months.april'),
        t('calendar.months.may'),
        t('calendar.months.june'),
        t('calendar.months.july'),
        t('calendar.months.august'),
        t('calendar.months.september'),
        t('calendar.months.october'),
        t('calendar.months.november'),
        t('calendar.months.december')
    ];

    const dayNames = [
        t('calendar.days.sunday'),
        t('calendar.days.monday'),
        t('calendar.days.tuesday'),
        t('calendar.days.wednesday'),
        t('calendar.days.thursday'),
        t('calendar.days.friday'),
        t('calendar.days.saturday')
    ];
    
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();

    const generateCalendar = () => {
        const calendar = [dayNames];
        let week = Array(7).fill(null);

        for (let i = 0; i < firstDayOfMonth; i++) {
            week[i] = null;
        }
        let dayCounter = 1;
        for (let i = firstDayOfMonth; i < 7; i++) {
            week[i] = dayCounter++;
        }
        calendar.push([...week]);

        while (dayCounter <= daysInMonth) {
            week = Array(7).fill(null);
            for (let i = 0; i < 7 && dayCounter <= daysInMonth; i++) {
                week[i] = dayCounter++;
            }
            calendar.push([...week]);
        }

        return calendar;
    };

    const calendar = generateCalendar();

    const isToday = (day: string | number) => {
        if (!day) return false;
        return day === today.getDate() &&
            month === today.getMonth() &&
            year === today.getFullYear();
    };

    const previousMonth = () => {
        setCurrentDate(new Date(year, month - 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(year, month + 1));
    };

    return (
        <div className="rounded-xl p-6 shadow-sm bg-card">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold">{t('calendar.yourCalendar')}</h3>
            </div>
            <div className="flex justify-between items-center mb-4">
                <Button
                    variant="ghost"
                    onClick={previousMonth}
                    className="p-1 cursor-pointer rounded-full"
                    title="Previous month"
                >
                    <ChevronLeft className="w-5 h-5" />
                </Button>
                <span className="font-semibold">
                    {monthNames[month]} - {year}
                </span>
                <Button
                    variant="ghost"
                    onClick={nextMonth}
                    className="p-1 cursor-pointer rounded-full"
                    title="Next month"
                >
                    <ChevronRight className="w-5 h-5" />
                </Button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2">
                {calendar[0].map((day, idx) => (
                    <div key={idx} className="font-semibold text-muted-foreground py-2">
                        {day}
                    </div>
                ))}
            </div>
            {calendar.slice(1).map((week, weekIdx) => (
                <div key={weekIdx} className="grid grid-cols-7 gap-1 text-center">
                    {week.map((day, dayIdx) => (
                        <div
                            key={dayIdx}
                            className={`py-2 mb-1 text-sm rounded-full cursor-pointer ${isToday(day)
                                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold'
                                    : day
                                        ? 'hover:bg-card-secondary transition-colors'
                                        : ''
                                }`}
                        >
                            {day}
                        </div>
                    ))}
                </div>
            ))}
            <div className="mt-6 pt-4 border-t">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">{t('calendar.targetStudyTime')}</span>
                    <span className="text-xl font-bold">08h 30m</span>
                </div>
            </div>
        </div>
    );
}

export default DynamicCalendar;