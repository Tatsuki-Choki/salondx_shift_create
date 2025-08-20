import { Staff, StaffFormData, RequestFormData, StoreSettings, FormValidation } from '@/types';

class ValidationService {
  /**
   * Validate staff form data
   */
  validateStaff(data: StaffFormData): FormValidation {
    const errors: { [field: string]: string } = {};

    // Name validation
    if (!data.name || data.name.trim().length === 0) {
      errors.name = '氏名は必須です';
    } else if (data.name.trim().length < 2) {
      errors.name = '氏名は2文字以上で入力してください';
    } else if (data.name.trim().length > 50) {
      errors.name = '氏名は50文字以内で入力してください';
    }

    // Role validation
    const validRoles = ['スタイリスト', 'アシスタント', 'レセプショニスト', 'ネイリスト'];
    if (!data.role) {
      errors.role = '役職は必須です';
    } else if (!validRoles.includes(data.role)) {
      errors.role = '有効な役職を選択してください';
    }

    // Email validation (optional)
    if (data.email && data.email.trim().length > 0) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email.trim())) {
        errors.email = '有効なメールアドレスを入力してください';
      }
    }

    // Phone validation (optional)
    if (data.phone && data.phone.trim().length > 0) {
      const phoneRegex = /^[\d\-\(\)\+\s]+$/;
      if (!phoneRegex.test(data.phone.trim())) {
        errors.phone = '有効な電話番号を入力してください';
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  /**
   * Validate request form data
   */
  validateRequest(data: RequestFormData): FormValidation {
    const errors: { [field: string]: string } = {};

    // Date validation
    if (!data.date) {
      errors.date = '日付は必須です';
    } else {
      const selectedDate = new Date(data.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        errors.date = '過去の日付は選択できません';
      }
    }

    // Type validation
    const validTypes = ['off', 'morning', 'evening', 'any'];
    if (!data.type) {
      errors.type = '希望種別は必須です';
    } else if (!validTypes.includes(data.type)) {
      errors.type = '有効な希望種別を選択してください';
    }

    // Priority validation
    const validPriorities = ['low', 'medium', 'high'];
    if (!data.priority) {
      errors.priority = '優先度は必須です';
    } else if (!validPriorities.includes(data.priority)) {
      errors.priority = '有効な優先度を選択してください';
    }

    // Reason validation (optional, but with length limit)
    if (data.reason && data.reason.trim().length > 200) {
      errors.reason = '理由は200文字以内で入力してください';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  /**
   * Validate store settings
   */
  validateStoreSettings(settings: StoreSettings): FormValidation {
    const errors: { [field: string]: string } = {};

    // Time format validation
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;

    if (!settings.openTime) {
      errors.openTime = '開店時間は必須です';
    } else if (!timeRegex.test(settings.openTime)) {
      errors.openTime = '有効な時間形式で入力してください（HH:MM）';
    }

    if (!settings.closeTime) {
      errors.closeTime = '閉店時間は必須です';
    } else if (!timeRegex.test(settings.closeTime)) {
      errors.closeTime = '有効な時間形式で入力してください（HH:MM）';
    }

    // Validate opening hours logic
    if (settings.openTime && settings.closeTime) {
      const openTime = this.timeToMinutes(settings.openTime);
      const closeTime = this.timeToMinutes(settings.closeTime);
      
      if (openTime >= closeTime) {
        errors.closeTime = '閉店時間は開店時間より後である必要があります';
      }
    }

    // Validate shift times
    if (!settings.shifts.morning.start || !timeRegex.test(settings.shifts.morning.start)) {
      errors['morning.start'] = '早番開始時間は必須です';
    }

    if (!settings.shifts.morning.end || !timeRegex.test(settings.shifts.morning.end)) {
      errors['morning.end'] = '早番終了時間は必須です';
    }

    if (!settings.shifts.evening.start || !timeRegex.test(settings.shifts.evening.start)) {
      errors['evening.start'] = '遅番開始時間は必須です';
    }

    if (!settings.shifts.evening.end || !timeRegex.test(settings.shifts.evening.end)) {
      errors['evening.end'] = '遅番終了時間は必須です';
    }

    // Validate shift time logic
    if (settings.shifts.morning.start && settings.shifts.morning.end) {
      const morningStart = this.timeToMinutes(settings.shifts.morning.start);
      const morningEnd = this.timeToMinutes(settings.shifts.morning.end);
      
      if (morningStart >= morningEnd) {
        errors['morning.end'] = '早番終了時間は開始時間より後である必要があります';
      }
    }

    if (settings.shifts.evening.start && settings.shifts.evening.end) {
      const eveningStart = this.timeToMinutes(settings.shifts.evening.start);
      const eveningEnd = this.timeToMinutes(settings.shifts.evening.end);
      
      if (eveningStart >= eveningEnd) {
        errors['evening.end'] = '遅番終了時間は開始時間より後である必要があります';
      }
    }

    // Validate minimum staff requirements
    settings.minStaff.forEach((requirement, index) => {
      if (!Number.isInteger(requirement.morning) || requirement.morning < 0) {
        errors[`minStaff.${index}.morning`] = '有効な早番最低人数を入力してください';
      }
      
      if (!Number.isInteger(requirement.evening) || requirement.evening < 0) {
        errors[`minStaff.${index}.evening`] = '有効な遅番最低人数を入力してください';
      }
    });

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  /**
   * Check for duplicate staff names
   */
  checkDuplicateStaff(staffList: Staff[], newName: string, excludeId?: string): boolean {
    return staffList.some(staff => 
      staff.id !== excludeId && 
      staff.name.trim().toLowerCase() === newName.trim().toLowerCase()
    );
  }

  /**
   * Validate date string format
   */
  isValidDate(dateString: string): boolean {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime());
  }

  /**
   * Check if date is in the future
   */
  isFutureDate(dateString: string): boolean {
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date >= today;
  }

  /**
   * Convert time string to minutes for comparison
   */
  private timeToMinutes(timeString: string): number {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  }

  /**
   * Sanitize input string
   */
  sanitizeString(input: string): string {
    return input.trim().replace(/[<>\"'/\\]/g, '');
  }

  /**
   * Validate shift assignment
   */
  validateShiftAssignment(
    date: string,
    shiftType: 'morning' | 'evening',
    staffIds: string[],
    allStaff: Staff[],
    minRequired: number
  ): FormValidation {
    const errors: { [field: string]: string } = {};

    // Check if staff IDs exist
    const validStaffIds = allStaff.map(staff => staff.id);
    const invalidIds = staffIds.filter(id => !validStaffIds.includes(id));
    
    if (invalidIds.length > 0) {
      errors.staff = `無効なスタッフIDが含まれています: ${invalidIds.join(', ')}`;
    }

    // Check minimum requirements
    if (staffIds.length < minRequired) {
      errors.minimum = `${shiftType === 'morning' ? '早番' : '遅番'}には最低${minRequired}人のスタッフが必要です`;
    }

    // Check for duplicate assignments
    const uniqueIds = new Set(staffIds);
    if (uniqueIds.size !== staffIds.length) {
      errors.duplicates = '同じスタッフが重複して割り当てられています';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
}

// Export singleton instance
export const validationService = new ValidationService();
export default validationService;