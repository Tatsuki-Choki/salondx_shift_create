/**
 * Date utility functions for the salon shift management system
 */

/**
 * Format date to YYYY-MM-DD string
 */
export const formatDate = (date: Date): string => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

/**
 * Get days in a month
 */
export const getDaysInMonth = (date: Date): Date[] => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const days: Date[] = [];
  
  for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
    days.push(new Date(d));
  }
  return days;
};

/**
 * Get days in a week starting from Monday
 */
export const getWeekDays = (date: Date): Date[] => {
  const week: Date[] = [];
  const startOfWeek = new Date(date);
  const day = startOfWeek.getDay();
  const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
  startOfWeek.setDate(diff);
  
  for (let i = 0; i < 7; i++) {
    week.push(new Date(startOfWeek));
    startOfWeek.setDate(startOfWeek.getDate() + 1);
  }
  return week;
};

/**
 * Check if two dates are the same day
 */
export const isSameDay = (date1: Date, date2: Date): boolean => {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate();
};

/**
 * Check if date is today
 */
export const isToday = (date: Date): boolean => {
  return isSameDay(date, new Date());
};

/**
 * Get day of week index (0 = Monday, 6 = Sunday)
 */
export const getDayOfWeekIndex = (date: Date): number => {
  const day = date.getDay();
  return day === 0 ? 6 : day - 1; // Convert Sunday (0) to 6, Monday (1) to 0, etc.
};

/**
 * Get Japanese day names
 */
export const getJapaneseDayNames = (): string[] => {
  return ['日', '月', '火', '水', '木', '金', '土'];
};

/**
 * Get Japanese weekday names
 */
export const getJapaneseWeekdayNames = (): string[] => {
  return ['月曜', '火曜', '水曜', '木曜', '金曜', '土曜', '日曜'];
};

/**
 * Format date to Japanese locale string
 */
export const formatDateJapanese = (date: Date): string => {
  return date.toLocaleDateString('ja-JP', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    weekday: 'short'
  });
};

/**
 * Format date for display in calendar
 */
export const formatDateForCalendar = (date: Date): string => {
  return date.toLocaleDateString('ja-JP', {
    month: 'numeric',
    day: 'numeric'
  });
};

/**
 * Get date range between two dates
 */
export const getDateRange = (startDate: Date, endDate: Date): Date[] => {
  const dates: Date[] = [];
  const currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return dates;
};

/**
 * Add days to a date
 */
export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

/**
 * Subtract days from a date
 */
export const subtractDays = (date: Date, days: number): Date => {
  return addDays(date, -days);
};

/**
 * Get start of month
 */
export const getStartOfMonth = (date: Date): Date => {
  return new Date(date.getFullYear(), date.getMonth(), 1);
};

/**
 * Get end of month
 */
export const getEndOfMonth = (date: Date): Date => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
};

/**
 * Get start of week (Monday)
 */
export const getStartOfWeek = (date: Date): Date => {
  const startOfWeek = new Date(date);
  const day = startOfWeek.getDay();
  const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
  startOfWeek.setDate(diff);
  startOfWeek.setHours(0, 0, 0, 0);
  return startOfWeek;
};

/**
 * Get end of week (Sunday)
 */
export const getEndOfWeek = (date: Date): Date => {
  const endOfWeek = getStartOfWeek(date);
  endOfWeek.setDate(endOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);
  return endOfWeek;
};

/**
 * Check if a date is weekend (Saturday or Sunday)
 */
export const isWeekend = (date: Date): boolean => {
  const day = date.getDay();
  return day === 0 || day === 6;
};

/**
 * Parse date string (YYYY-MM-DD) to Date object
 */
export const parseDate = (dateString: string): Date | null => {
  try {
    const date = new Date(dateString + 'T00:00:00');
    return isNaN(date.getTime()) ? null : date;
  } catch {
    return null;
  }
};

/**
 * Get month navigation
 */
export const getMonthNavigation = (currentDate: Date) => {
  const previousMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
  const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
  
  return {
    previous: previousMonth,
    next: nextMonth,
    current: getStartOfMonth(currentDate)
  };
};

/**
 * Get week navigation
 */
export const getWeekNavigation = (currentDate: Date) => {
  const currentWeekStart = getStartOfWeek(currentDate);
  const previousWeek = addDays(currentWeekStart, -7);
  const nextWeek = addDays(currentWeekStart, 7);
  
  return {
    previous: previousWeek,
    next: nextWeek,
    current: currentWeekStart
  };
};

/**
 * Convert time string (HH:MM) to minutes since midnight
 */
export const timeToMinutes = (timeString: string): number => {
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
};

/**
 * Convert minutes since midnight to time string (HH:MM)
 */
export const minutesToTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
};

/**
 * Check if current time is within business hours
 */
export const isWithinBusinessHours = (openTime: string, closeTime: string): boolean => {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const openMinutes = timeToMinutes(openTime);
  const closeMinutes = timeToMinutes(closeTime);
  
  return currentMinutes >= openMinutes && currentMinutes <= closeMinutes;
};

/**
 * Calculate duration between two times in minutes
 */
export const getTimeDuration = (startTime: string, endTime: string): number => {
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);
  
  // Handle overnight shifts
  if (endMinutes <= startMinutes) {
    return (24 * 60 - startMinutes) + endMinutes;
  }
  
  return endMinutes - startMinutes;
};