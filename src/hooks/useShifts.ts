import { useAppContext } from '@/context/AppContext';
import { Shifts, ShiftType, Staff, AIShiftGenerationRequest } from '@/types';
import { geminiService } from '@/services';
import { 
  formatDate, 
  getDaysInMonth, 
  getWeekDays,
  getAssignedStaffCount,
  getRequiredStaffCount,
  isShiftAdequatelyStaffed,
  generateShiftSummary
} from '@/utils';
import { useToast } from './useToast';
import { useState } from 'react';

/**
 * Custom hook for managing shifts and AI generation
 */
export const useShifts = () => {
  const { state, setShifts, updateShift, setShiftStatus } = useAppContext();
  const { showError, showSuccess, showWarning } = useToast();
  const [isAIGenerating, setIsAIGenerating] = useState(false);

  // Assign staff to a shift
  const assignStaffToShift = (date: string, shiftType: ShiftType, staffId: string): boolean => {
    const dateShifts = state.shifts[date] || { morning: [], evening: [] };
    
    // Check if staff is already assigned to this shift
    if (dateShifts[shiftType].includes(staffId)) {
      showWarning('このスタッフは既にこのシフトに割り当てられています');
      return false;
    }

    // Check if staff is already assigned to the opposite shift on the same day
    const oppositeShift = shiftType === 'morning' ? 'evening' : 'morning';
    if (dateShifts[oppositeShift].includes(staffId)) {
      showWarning('このスタッフは既に同日の別シフトに割り当てられています');
      return false;
    }

    // Add staff to shift
    const updatedShifts = {
      ...dateShifts,
      [shiftType]: [...dateShifts[shiftType], staffId]
    };

    updateShift(date, updatedShifts);
    
    const staffName = state.staff.find(s => s.id === staffId)?.name || '';
    showSuccess(`${staffName}さんを${shiftType === 'morning' ? '早番' : '遅番'}に割り当てました`);
    return true;
  };

  // Remove staff from a shift
  const removeStaffFromShift = (date: string, shiftType: ShiftType, staffId: string): boolean => {
    const dateShifts = state.shifts[date];
    if (!dateShifts || !dateShifts[shiftType].includes(staffId)) {
      showError('このスタッフはこのシフトに割り当てられていません');
      return false;
    }

    const updatedShifts = {
      ...dateShifts,
      [shiftType]: dateShifts[shiftType].filter(id => id !== staffId)
    };

    updateShift(date, updatedShifts);
    
    const staffName = state.staff.find(s => s.id === staffId)?.name || '';
    showSuccess(`${staffName}さんを${shiftType === 'morning' ? '早番' : '遅番'}から削除しました`);
    return true;
  };

  // Clear all shifts for a date
  const clearDayShifts = (date: string): void => {
    updateShift(date, { morning: [], evening: [] });
    showSuccess('シフトをクリアしました');
  };

  // Clear all shifts
  const clearAllShifts = (): void => {
    setShifts({});
    showSuccess('全てのシフトをクリアしました');
  };

  // Generate AI shifts
  const generateAIShifts = async (dateRange: { startDate: string; endDate: string }): Promise<boolean> => {
    if (!geminiService.getAPIInfo().configured) {
      showError('Gemini API キーが設定されていません');
      return false;
    }

    setIsAIGenerating(true);

    try {
      const request: AIShiftGenerationRequest = {
        dateRange,
        staffList: state.staff,
        storeSettings: state.storeSettings,
        requests: state.requests,
        constraints: {
          minStaffPerShift: state.storeSettings.minStaff.reduce((acc, day, index) => {
            acc[`day_${index}`] = day.morning + day.evening;
            return acc;
          }, {} as { [key: string]: number }),
          maxConsecutiveDays: 5,
          restDaysBetweenShifts: 1
        }
      };

      const response = await geminiService.generateShifts(request);
      
      if (!response.success || !response.data) {
        showError(response.error?.message || 'AI シフト生成に失敗しました');
        return false;
      }

      // Apply the generated shifts
      const currentShifts = { ...state.shifts };
      const newShifts = { ...currentShifts, ...response.data.shifts };
      
      setShifts(newShifts);
      showSuccess(`AIシフトを生成しました。${response.data.summary}`);
      
      // Show conflicts if any
      if (response.data.conflicts && response.data.conflicts.length > 0) {
        response.data.conflicts.forEach(conflict => {
          showWarning(`${conflict.date}: ${conflict.issue}`);
        });
      }

      return true;
    } catch (error) {
      console.error('AI shift generation error:', error);
      showError('AI シフト生成中にエラーが発生しました');
      return false;
    } finally {
      setIsAIGenerating(false);
    }
  };

  // Get shift statistics
  const getShiftStats = (dateRange: { start: string; end: string }) => {
    return generateShiftSummary(
      state.shifts,
      state.staff,
      state.storeSettings,
      state.requests,
      dateRange
    );
  };

  // Check if date has adequate staffing
  const isDayAdequatelyStaffed = (date: string): boolean => {
    const morningAdequate = isShiftAdequatelyStaffed(state.shifts, state.storeSettings, date, 'morning');
    const eveningAdequate = isShiftAdequatelyStaffed(state.shifts, state.storeSettings, date, 'evening');
    return morningAdequate && eveningAdequate;
  };

  // Get understaffed shifts
  const getUnderstaffedDates = (dates: Date[]): string[] => {
    return dates
      .map(date => formatDate(date))
      .filter(dateStr => !isDayAdequatelyStaffed(dateStr));
  };

  // Confirm shift schedule
  const confirmShifts = (): boolean => {
    // Validate that all shifts meet minimum requirements
    const currentMonth = new Date();
    const daysInMonth = getDaysInMonth(currentMonth);
    const understaffedDates = getUnderstaffedDates(daysInMonth);

    if (understaffedDates.length > 0) {
      showError(`以下の日付で人数が不足しています: ${understaffedDates.slice(0, 3).join(', ')}${understaffedDates.length > 3 ? '...' : ''}`);
      return false;
    }

    setShiftStatus('confirmed');
    showSuccess('シフトを確定しました');
    return true;
  };

  // Set shifts to draft mode
  const setDraftMode = (): void => {
    setShiftStatus('draft');
    showSuccess('シフトを編集モードにしました');
  };

  // Get calendar data for rendering
  const getCalendarData = (currentDate: Date, viewMode: 'month' | 'week') => {
    const dates = viewMode === 'month' ? getDaysInMonth(currentDate) : getWeekDays(currentDate);
    
    return dates.map(date => {
      const dateStr = formatDate(date);
      const shifts = state.shifts[dateStr] || { morning: [], evening: [] };
      const requests = state.requests.filter(req => req.date === dateStr);
      
      return {
        date,
        dateStr,
        shifts,
        requests,
        isAdequatelyStaffed: isDayAdequatelyStaffed(dateStr),
        morningAssigned: shifts.morning.length,
        eveningAssigned: shifts.evening.length,
        morningRequired: getRequiredStaffCount(state.storeSettings, dateStr, 'morning'),
        eveningRequired: getRequiredStaffCount(state.storeSettings, dateStr, 'evening')
      };
    });
  };

  // Get staff workload
  const getStaffWorkload = (staffId: string, dateRange: { start: string; end: string }) => {
    const startDate = new Date(dateRange.start);
    const endDate = new Date(dateRange.end);
    const workDays: { date: string; shift: ShiftType }[] = [];

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = formatDate(d);
      const dayShifts = state.shifts[dateStr];
      
      if (dayShifts) {
        if (dayShifts.morning.includes(staffId)) {
          workDays.push({ date: dateStr, shift: 'morning' });
        }
        if (dayShifts.evening.includes(staffId)) {
          workDays.push({ date: dateStr, shift: 'evening' });
        }
      }
    }

    return {
      workDays,
      totalShifts: workDays.length,
      morningShifts: workDays.filter(w => w.shift === 'morning').length,
      eveningShifts: workDays.filter(w => w.shift === 'evening').length,
      uniqueDates: new Set(workDays.map(w => w.date)).size
    };
  };

  return {
    // State
    shifts: state.shifts,
    shiftStatus: state.shiftStatus,
    isAIGenerating,

    // Shift assignment actions
    assignStaffToShift,
    removeStaffFromShift,
    clearDayShifts,
    clearAllShifts,
    setShifts,

    // AI generation
    generateAIShifts,

    // Status management
    confirmShifts,
    setDraftMode,
    setShiftStatus,

    // Data retrieval
    getCalendarData,
    getShiftStats,
    getStaffWorkload,
    isDayAdequatelyStaffed,
    getUnderstaffedDates,

    // Utility functions
    getAssignedStaffCount: (date: string, shiftType: ShiftType) => 
      getAssignedStaffCount(state.shifts, date, shiftType),
    getRequiredStaffCount: (date: string, shiftType: ShiftType) => 
      getRequiredStaffCount(state.storeSettings, date, shiftType)
  };
};

export default useShifts;