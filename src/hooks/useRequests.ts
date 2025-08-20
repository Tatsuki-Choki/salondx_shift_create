import { useAppContext } from '@/context/AppContext';
import { ShiftRequest, RequestFormData, RequestType, RequestPriority } from '@/types';
import { validationService } from '@/services';
import { generateId, formatDateJapanese, parseDate } from '@/utils';
import { useToast } from './useToast';

/**
 * Custom hook for managing shift requests
 */
export const useRequests = () => {
  const { state, setRequests, addRequest, updateRequest, deleteRequest } = useAppContext();
  const { showError, showSuccess, showWarning } = useToast();

  // Submit a new request
  const submitRequest = (staffId: string, formData: RequestFormData): boolean => {
    // Validate form data
    const validation = validationService.validateRequest(formData);
    if (!validation.isValid) {
      const firstError = Object.values(validation.errors)[0];
      showError(firstError);
      return false;
    }

    // Check if there's already a request for this staff and date
    const existingRequest = state.requests.find(
      req => req.staffId === staffId && req.date === formData.date
    );

    if (existingRequest) {
      showError('この日付には既に希望が提出されています');
      return false;
    }

    // Check if shift is already confirmed
    if (state.shiftStatus === 'confirmed') {
      showError('確定されたシフトには希望を提出できません');
      return false;
    }

    // Create new request
    const newRequest: ShiftRequest = {
      id: generateId(),
      staffId,
      date: formData.date,
      type: formData.type,
      reason: formData.reason,
      priority: formData.priority,
      submitted: new Date(),
      status: 'pending'
    };

    addRequest(newRequest);
    
    const dateStr = parseDate(formData.date);
    const formattedDate = dateStr ? formatDateJapanese(dateStr) : formData.date;
    const typeLabels = {
      'off': '休み',
      'morning': '早番',
      'evening': '遅番',
      'any': '指定なし'
    };
    
    showSuccess(`${formattedDate}の${typeLabels[formData.type]}希望を提出しました`);
    return true;
  };

  // Update an existing request
  const editRequest = (requestId: string, updates: Partial<RequestFormData>): boolean => {
    const existingRequest = state.requests.find(req => req.id === requestId);
    if (!existingRequest) {
      showError('希望が見つかりません');
      return false;
    }

    // Check if shift is already confirmed
    if (state.shiftStatus === 'confirmed') {
      showError('確定されたシフトの希望は変更できません');
      return false;
    }

    // Validate updates if provided
    if (updates.date || updates.type || updates.priority) {
      const formData: RequestFormData = {
        date: updates.date || existingRequest.date,
        type: updates.type || existingRequest.type,
        priority: updates.priority || existingRequest.priority,
        reason: updates.reason !== undefined ? updates.reason : existingRequest.reason
      };

      const validation = validationService.validateRequest(formData);
      if (!validation.isValid) {
        const firstError = Object.values(validation.errors)[0];
        showError(firstError);
        return false;
      }

      // Check for conflicts with other requests (if date is changing)
      if (updates.date && updates.date !== existingRequest.date) {
        const conflictingRequest = state.requests.find(
          req => req.id !== requestId && req.staffId === existingRequest.staffId && req.date === updates.date
        );

        if (conflictingRequest) {
          showError('この日付には既に別の希望が提出されています');
          return false;
        }
      }
    }

    // Update request
    const requestUpdates: Partial<ShiftRequest> = {
      ...(updates.date && { date: updates.date }),
      ...(updates.type && { type: updates.type }),
      ...(updates.priority && { priority: updates.priority }),
      ...(updates.reason !== undefined && { reason: updates.reason })
    };

    updateRequest(requestId, requestUpdates);
    showSuccess('希望を更新しました');
    return true;
  };

  // Remove a request
  const removeRequest = (requestId: string): boolean => {
    const request = state.requests.find(req => req.id === requestId);
    if (!request) {
      showError('希望が見つかりません');
      return false;
    }

    // Check if shift is already confirmed
    if (state.shiftStatus === 'confirmed') {
      showError('確定されたシフトの希望は削除できません');
      return false;
    }

    deleteRequest(requestId);
    
    const dateStr = parseDate(request.date);
    const formattedDate = dateStr ? formatDateJapanese(dateStr) : request.date;
    showSuccess(`${formattedDate}の希望を削除しました`);
    return true;
  };

  // Get requests for a specific staff member
  const getStaffRequests = (staffId: string): ShiftRequest[] => {
    return state.requests
      .filter(req => req.staffId === staffId)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  // Get requests for a specific date
  const getDateRequests = (date: string): ShiftRequest[] => {
    return state.requests.filter(req => req.date === date);
  };

  // Get requests by type
  const getRequestsByType = (type: RequestType): ShiftRequest[] => {
    return state.requests.filter(req => req.type === type);
  };

  // Get requests by status
  const getRequestsByStatus = (status: ShiftRequest['status']): ShiftRequest[] => {
    return state.requests.filter(req => req.status === status);
  };

  // Get request statistics
  const getRequestStats = () => {
    const total = state.requests.length;
    
    const byType = state.requests.reduce((acc, req) => {
      acc[req.type] = (acc[req.type] || 0) + 1;
      return acc;
    }, {} as Record<RequestType, number>);

    const byStatus = state.requests.reduce((acc, req) => {
      acc[req.status] = (acc[req.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byPriority = state.requests.reduce((acc, req) => {
      acc[req.priority] = (acc[req.priority] || 0) + 1;
      return acc;
    }, {} as Record<RequestPriority, number>);

    return {
      total,
      byType,
      byStatus,
      byPriority
    };
  };

  // Check if a staff member can submit a request for a specific date
  const canSubmitRequest = (staffId: string, date: string): boolean => {
    // Check if shift is confirmed
    if (state.shiftStatus === 'confirmed') {
      return false;
    }

    // Check if there's already a request for this date
    const existingRequest = state.requests.find(
      req => req.staffId === staffId && req.date === date
    );

    if (existingRequest) {
      return false;
    }

    // Check if date is in the past
    const requestDate = parseDate(date);
    if (!requestDate) {
      return false;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return requestDate >= today;
  };

  // Get pending requests that need admin attention
  const getPendingRequests = (): ShiftRequest[] => {
    return state.requests
      .filter(req => req.status === 'pending')
      .sort((a, b) => new Date(a.submitted).getTime() - new Date(b.submitted).getTime());
  };

  // Approve a request (admin function)
  const approveRequest = (requestId: string): boolean => {
    const request = state.requests.find(req => req.id === requestId);
    if (!request) {
      showError('希望が見つかりません');
      return false;
    }

    if (request.status !== 'pending') {
      showError('この希望は既に処理済みです');
      return false;
    }

    updateRequest(requestId, { status: 'approved' });
    showSuccess('希望を承認しました');
    return true;
  };

  // Deny a request (admin function)
  const denyRequest = (requestId: string): boolean => {
    const request = state.requests.find(req => req.id === requestId);
    if (!request) {
      showError('希望が見つかりません');
      return false;
    }

    if (request.status !== 'pending') {
      showError('この希望は既に処理済みです');
      return false;
    }

    updateRequest(requestId, { status: 'denied' });
    showSuccess('希望を却下しました');
    return true;
  };

  // Validate request form data
  const validateRequestData = (formData: RequestFormData) => {
    return validationService.validateRequest(formData);
  };

  // Clear old requests (utility function)
  const clearOldRequests = (daysOld = 30): number => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const oldRequests = state.requests.filter(req => {
      const requestDate = parseDate(req.date);
      return requestDate && requestDate < cutoffDate;
    });

    if (oldRequests.length > 0) {
      const updatedRequests = state.requests.filter(req => {
        const requestDate = parseDate(req.date);
        return !requestDate || requestDate >= cutoffDate;
      });

      setRequests(updatedRequests);
      showSuccess(`${oldRequests.length}件の古い希望を削除しました`);
    }

    return oldRequests.length;
  };

  return {
    // State
    requests: state.requests,
    
    // Request management
    submitRequest,
    editRequest,
    removeRequest,
    
    // Data retrieval
    getStaffRequests,
    getDateRequests,
    getRequestsByType,
    getRequestsByStatus,
    getRequestStats,
    getPendingRequests,
    
    // Permission checks
    canSubmitRequest,
    
    // Admin functions
    approveRequest,
    denyRequest,
    
    // Validation
    validateRequestData,
    
    // Utilities
    clearOldRequests,
    setRequests
  };
};

export default useRequests;