import { useAppContext } from '@/context/AppContext';
import { Staff, StaffFormData } from '@/types';
import { validationService } from '@/services';
import { generateId } from '@/utils';
import { useToast } from './useToast';

/**
 * Custom hook for managing staff data and operations
 */
export const useStaff = () => {
  const { state, setStaff, addStaff, updateStaff, deleteStaff } = useAppContext();
  const { showError, showSuccess } = useToast();

  const createStaff = (formData: StaffFormData): boolean => {
    // Validate form data
    const validation = validationService.validateStaff(formData);
    if (!validation.isValid) {
      const firstError = Object.values(validation.errors)[0];
      showError(firstError);
      return false;
    }

    // Check for duplicate names
    if (validationService.checkDuplicateStaff(state.staff, formData.name)) {
      showError('同じ名前のスタッフが既に存在します');
      return false;
    }

    // Create new staff member
    const newStaff: Staff = {
      id: generateId(),
      name: formData.name.trim(),
      role: formData.role,
      email: formData.email?.trim(),
      phone: formData.phone?.trim(),
      startDate: new Date()
    };

    addStaff(newStaff);
    showSuccess(`${newStaff.name}さんを追加しました`);
    return true;
  };

  const editStaff = (id: string, formData: Partial<StaffFormData>): boolean => {
    const existingStaff = state.staff.find(s => s.id === id);
    if (!existingStaff) {
      showError('スタッフが見つかりません');
      return false;
    }

    // If name is being updated, validate it
    if (formData.name) {
      const validation = validationService.validateStaff({
        name: formData.name,
        role: formData.role || existingStaff.role,
        email: formData.email,
        phone: formData.phone
      });

      if (!validation.isValid) {
        const firstError = Object.values(validation.errors)[0];
        showError(firstError);
        return false;
      }

      // Check for duplicate names (excluding current staff)
      if (validationService.checkDuplicateStaff(state.staff, formData.name, id)) {
        showError('同じ名前のスタッフが既に存在します');
        return false;
      }
    }

    // Update staff
    const updates: Partial<Staff> = {
      ...(formData.name && { name: formData.name.trim() }),
      ...(formData.role && { role: formData.role }),
      ...(formData.email !== undefined && { email: formData.email?.trim() }),
      ...(formData.phone !== undefined && { phone: formData.phone?.trim() })
    };

    updateStaff(id, updates);
    showSuccess(`${existingStaff.name}さんの情報を更新しました`);
    return true;
  };

  const removeStaff = (id: string): boolean => {
    const staffMember = state.staff.find(s => s.id === id);
    if (!staffMember) {
      showError('スタッフが見つかりません');
      return false;
    }

    // Check if staff has any shifts assigned
    const hasAssignedShifts = Object.values(state.shifts).some(dayShifts => 
      dayShifts.morning.includes(id) || dayShifts.evening.includes(id)
    );

    if (hasAssignedShifts) {
      showError('シフトが割り当てられているスタッフは削除できません');
      return false;
    }

    deleteStaff(id);
    showSuccess(`${staffMember.name}さんを削除しました`);
    return true;
  };

  const getStaffById = (id: string): Staff | undefined => {
    return state.staff.find(staff => staff.id === id);
  };

  const getStaffByRole = (role: Staff['role']): Staff[] => {
    return state.staff.filter(staff => staff.role === role);
  };

  const searchStaff = (query: string): Staff[] => {
    if (!query.trim()) return state.staff;
    
    const searchTerm = query.toLowerCase().trim();
    return state.staff.filter(staff =>
      staff.name.toLowerCase().includes(searchTerm) ||
      staff.role.toLowerCase().includes(searchTerm) ||
      (staff.email && staff.email.toLowerCase().includes(searchTerm))
    );
  };

  const getStaffStats = () => {
    const total = state.staff.length;
    const byRole = state.staff.reduce((acc, staff) => {
      acc[staff.role] = (acc[staff.role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total,
      byRole,
      roles: Object.keys(byRole)
    };
  };

  const validateStaffData = (formData: StaffFormData) => {
    return validationService.validateStaff(formData);
  };

  return {
    // State
    staff: state.staff,
    
    // Actions
    createStaff,
    editStaff,
    removeStaff,
    setStaff,
    
    // Getters
    getStaffById,
    getStaffByRole,
    searchStaff,
    getStaffStats,
    
    // Validation
    validateStaffData
  };
};

export default useStaff;