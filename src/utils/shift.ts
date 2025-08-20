import { Staff, Shifts, StoreSettings, ShiftRequest, ShiftType } from '@/types';
import { getDayOfWeekIndex } from './date';

/**
 * Shift management utility functions
 */

/**
 * Get assigned staff count for a specific date and shift
 */
export const getAssignedStaffCount = (
  shifts: Shifts,
  date: string,
  shiftType: ShiftType
): number => {
  const dateShifts = shifts[date];
  if (!dateShifts || !dateShifts[shiftType]) {
    return 0;
  }
  return dateShifts[shiftType].length;
};

/**
 * Get required staff count for a specific date and shift
 */
export const getRequiredStaffCount = (
  storeSettings: StoreSettings,
  date: string,
  shiftType: ShiftType
): number => {
  const dateObj = new Date(date);
  const dayIndex = getDayOfWeekIndex(dateObj);
  return storeSettings.minStaff[dayIndex][shiftType];
};

/**
 * Check if a shift meets minimum staffing requirements
 */
export const isShiftAdequatelyStaffed = (
  shifts: Shifts,
  storeSettings: StoreSettings,
  date: string,
  shiftType: ShiftType
): boolean => {
  const assigned = getAssignedStaffCount(shifts, date, shiftType);
  const required = getRequiredStaffCount(storeSettings, date, shiftType);
  return assigned >= required;
};

/**
 * Get all dates where shifts are understaffed
 */
export const getUnderstaffedShifts = (
  shifts: Shifts,
  storeSettings: StoreSettings,
  dateRange: { start: string; end: string }
): Array<{ date: string; shift: ShiftType; assigned: number; required: number }> => {
  const understaffed: Array<{ date: string; shift: ShiftType; assigned: number; required: number }> = [];
  const startDate = new Date(dateRange.start);
  const endDate = new Date(dateRange.end);
  
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0];
    
    (['morning', 'evening'] as ShiftType[]).forEach(shift => {
      const assigned = getAssignedStaffCount(shifts, dateStr, shift);
      const required = getRequiredStaffCount(storeSettings, dateStr, shift);
      
      if (assigned < required) {
        understaffed.push({ date: dateStr, shift, assigned, required });
      }
    });
  }
  
  return understaffed;
};

/**
 * Get staff member's assigned shifts for a date range
 */
export const getStaffShifts = (
  shifts: Shifts,
  staffId: string,
  dateRange: { start: string; end: string }
): Array<{ date: string; shift: ShiftType }> => {
  const staffShifts: Array<{ date: string; shift: ShiftType }> = [];
  const startDate = new Date(dateRange.start);
  const endDate = new Date(dateRange.end);
  
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0];
    const dateShifts = shifts[dateStr];
    
    if (dateShifts) {
      (['morning', 'evening'] as ShiftType[]).forEach(shift => {
        if (dateShifts[shift] && dateShifts[shift].includes(staffId)) {
          staffShifts.push({ date: dateStr, shift });
        }
      });
    }
  }
  
  return staffShifts;
};

/**
 * Calculate staff workload (total shifts) for a date range
 */
export const calculateStaffWorkload = (
  shifts: Shifts,
  staffId: string,
  dateRange: { start: string; end: string }
): number => {
  return getStaffShifts(shifts, staffId, dateRange).length;
};

/**
 * Get staff utilization statistics
 */
export const getStaffUtilizationStats = (
  shifts: Shifts,
  staffList: Staff[],
  dateRange: { start: string; end: string }
) => {
  const stats = staffList.map(staff => {
    const workload = calculateStaffWorkload(shifts, staff.id, dateRange);
    const staffShifts = getStaffShifts(shifts, staff.id, dateRange);
    
    return {
      staff,
      totalShifts: workload,
      morningShifts: staffShifts.filter(s => s.shift === 'morning').length,
      eveningShifts: staffShifts.filter(s => s.shift === 'evening').length,
      workingDays: new Set(staffShifts.map(s => s.date)).size
    };
  });

  // Calculate averages
  const totalShifts = stats.reduce((sum, stat) => sum + stat.totalShifts, 0);
  const averageShifts = staffList.length > 0 ? totalShifts / staffList.length : 0;

  return {
    individual: stats,
    average: averageShifts,
    total: totalShifts
  };
};

/**
 * Check for consecutive working days for a staff member
 */
export const getConsecutiveWorkingDays = (
  shifts: Shifts,
  staffId: string,
  dateRange: { start: string; end: string }
): Array<{ start: string; end: string; days: number }> => {
  const staffShifts = getStaffShifts(shifts, staffId, dateRange);
  const workingDates = new Set(staffShifts.map(s => s.date));
  const sortedDates = Array.from(workingDates).sort();
  
  const consecutivePeroids: Array<{ start: string; end: string; days: number }> = [];
  let currentStart = '';
  let currentEnd = '';
  let consecutiveDays = 0;
  
  sortedDates.forEach((date, index) => {
    const dateObj = new Date(date);
    const prevDate = index > 0 ? new Date(sortedDates[index - 1]) : null;
    
    if (!prevDate || dateObj.getTime() - prevDate.getTime() > 86400000) { // More than 1 day gap
      if (consecutiveDays > 1) {
        consecutivePeroids.push({ start: currentStart, end: currentEnd, days: consecutiveDays });
      }
      currentStart = date;
      currentEnd = date;
      consecutiveDays = 1;
    } else {
      currentEnd = date;
      consecutiveDays++;
    }
    
    // Handle last period
    if (index === sortedDates.length - 1 && consecutiveDays > 1) {
      consecutivePeroids.push({ start: currentStart, end: currentEnd, days: consecutiveDays });
    }
  });
  
  return consecutivePeroids;
};

/**
 * Check for shift conflicts (staff assigned to both morning and evening on same day)
 */
export const getShiftConflicts = (
  shifts: Shifts,
  dateRange: { start: string; end: string }
): Array<{ date: string; staffId: string; staffName: string }> => {
  const conflicts: Array<{ date: string; staffId: string; staffName: string }> = [];
  const startDate = new Date(dateRange.start);
  const endDate = new Date(dateRange.end);
  
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0];
    const dateShifts = shifts[dateStr];
    
    if (dateShifts && dateShifts.morning && dateShifts.evening) {
      const conflictingStaff = dateShifts.morning.filter(staffId => 
        dateShifts.evening.includes(staffId)
      );
      
      conflictingStaff.forEach(staffId => {
        conflicts.push({ 
          date: dateStr, 
          staffId, 
          staffName: '' // Will be populated by the calling component
        });
      });
    }
  }
  
  return conflicts;
};

/**
 * Validate staff assignment against requests
 */
export const validateAssignmentAgainstRequests = (
  shifts: Shifts,
  requests: ShiftRequest[],
  dateRange: { start: string; end: string }
): Array<{ date: string; staffId: string; requestType: string; assignedShift: ShiftType }> => {
  const violations: Array<{ date: string; staffId: string; requestType: string; assignedShift: ShiftType }> = [];
  const startDate = new Date(dateRange.start);
  const endDate = new Date(dateRange.end);
  
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0];
    const dateShifts = shifts[dateStr];
    
    if (!dateShifts) continue;
    
    // Check requests for this date
    const dateRequests = requests.filter(req => req.date === dateStr);
    
    dateRequests.forEach(request => {
      if (request.type === 'off') {
        // Check if staff is assigned despite requesting off
        (['morning', 'evening'] as ShiftType[]).forEach(shift => {
          if (dateShifts[shift] && dateShifts[shift].includes(request.staffId)) {
            violations.push({
              date: dateStr,
              staffId: request.staffId,
              requestType: request.type,
              assignedShift: shift
            });
          }
        });
      } else if (request.type === 'morning' || request.type === 'evening') {
        // Check if staff is assigned to opposite shift
        const oppositeShift = request.type === 'morning' ? 'evening' : 'morning';
        if (dateShifts[oppositeShift] && dateShifts[oppositeShift].includes(request.staffId)) {
          violations.push({
            date: dateStr,
            staffId: request.staffId,
            requestType: request.type,
            assignedShift: oppositeShift
          });
        }
      }
    });
  }
  
  return violations;
};

/**
 * Get shift coverage statistics
 */
export const getShiftCoverageStats = (
  shifts: Shifts,
  storeSettings: StoreSettings,
  dateRange: { start: string; end: string }
) => {
  let totalRequired = 0;
  let totalAssigned = 0;
  let adequateShifts = 0;
  let totalShifts = 0;
  
  const startDate = new Date(dateRange.start);
  const endDate = new Date(dateRange.end);
  
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0];
    
    (['morning', 'evening'] as ShiftType[]).forEach(shift => {
      const required = getRequiredStaffCount(storeSettings, dateStr, shift);
      const assigned = getAssignedStaffCount(shifts, dateStr, shift);
      
      totalRequired += required;
      totalAssigned += assigned;
      totalShifts++;
      
      if (assigned >= required) {
        adequateShifts++;
      }
    });
  }
  
  return {
    totalRequired,
    totalAssigned,
    adequateShifts,
    totalShifts,
    coverageRate: totalRequired > 0 ? (totalAssigned / totalRequired) * 100 : 0,
    adequacyRate: totalShifts > 0 ? (adequateShifts / totalShifts) * 100 : 0
  };
};

/**
 * Generate shift summary report
 */
export const generateShiftSummary = (
  shifts: Shifts,
  staffList: Staff[],
  storeSettings: StoreSettings,
  requests: ShiftRequest[],
  dateRange: { start: string; end: string }
) => {
  const coverageStats = getShiftCoverageStats(shifts, storeSettings, dateRange);
  const utilizationStats = getStaffUtilizationStats(shifts, staffList, dateRange);
  const understaffedShifts = getUnderstaffedShifts(shifts, storeSettings, dateRange);
  const conflicts = getShiftConflicts(shifts, dateRange);
  const requestViolations = validateAssignmentAgainstRequests(shifts, requests, dateRange);
  
  return {
    dateRange,
    coverage: coverageStats,
    utilization: utilizationStats,
    issues: {
      understaffedShifts,
      conflicts,
      requestViolations
    },
    totalStaff: staffList.length,
    totalRequests: requests.length
  };
};