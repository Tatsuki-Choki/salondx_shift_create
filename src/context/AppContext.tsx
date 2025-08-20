import React, { createContext, useContext, useEffect, useReducer, ReactNode } from 'react';
import { 
  AppState, 
  Staff, 
  StoreSettings, 
  Shifts, 
  ShiftRequest, 
  ShiftStatus,
  ToastMessage,
  ToastType 
} from '@/types';
import { storageService } from '@/services';

// Action types
type AppAction = 
  | { type: 'SET_STAFF'; payload: Staff[] }
  | { type: 'ADD_STAFF'; payload: Staff }
  | { type: 'UPDATE_STAFF'; payload: { id: string; updates: Partial<Staff> } }
  | { type: 'DELETE_STAFF'; payload: string }
  | { type: 'SET_STORE_SETTINGS'; payload: StoreSettings }
  | { type: 'SET_SHIFTS'; payload: Shifts }
  | { type: 'UPDATE_SHIFT'; payload: { date: string; shifts: { morning: string[]; evening: string[] } } }
  | { type: 'SET_REQUESTS'; payload: ShiftRequest[] }
  | { type: 'ADD_REQUEST'; payload: ShiftRequest }
  | { type: 'UPDATE_REQUEST'; payload: { id: string; updates: Partial<ShiftRequest> } }
  | { type: 'DELETE_REQUEST'; payload: string }
  | { type: 'SET_SHIFT_STATUS'; payload: ShiftStatus }
  | { type: 'SET_CURRENT_STAFF_ID'; payload: string | null }
  | { type: 'ADD_TOAST'; payload: Omit<ToastMessage, 'id'> }
  | { type: 'REMOVE_TOAST'; payload: number }
  | { type: 'LOAD_DATA'; payload: Partial<AppState> };

// Extended app state with UI state
interface ExtendedAppState extends AppState {
  toasts: ToastMessage[];
}

// Initial state
const getInitialState = (): ExtendedAppState => {
  const storageData = storageService.loadData();
  
  return {
    staff: storageData.staff,
    storeSettings: storageData.storeSettings,
    shifts: storageData.shifts,
    requests: storageData.requests,
    shiftStatus: storageData.shiftStatus,
    currentStaffId: null,
    toasts: []
  };
};

// Reducer
const appReducer = (state: ExtendedAppState, action: AppAction): ExtendedAppState => {
  switch (action.type) {
    case 'SET_STAFF':
      return { ...state, staff: action.payload };
      
    case 'ADD_STAFF':
      return { ...state, staff: [...state.staff, action.payload] };
      
    case 'UPDATE_STAFF':
      return {
        ...state,
        staff: state.staff.map(staff =>
          staff.id === action.payload.id
            ? { ...staff, ...action.payload.updates }
            : staff
        )
      };
      
    case 'DELETE_STAFF':
      return {
        ...state,
        staff: state.staff.filter(staff => staff.id !== action.payload),
        currentStaffId: state.currentStaffId === action.payload ? null : state.currentStaffId
      };
      
    case 'SET_STORE_SETTINGS':
      return { ...state, storeSettings: action.payload };
      
    case 'SET_SHIFTS':
      return { ...state, shifts: action.payload };
      
    case 'UPDATE_SHIFT':
      return {
        ...state,
        shifts: {
          ...state.shifts,
          [action.payload.date]: action.payload.shifts
        }
      };
      
    case 'SET_REQUESTS':
      return { ...state, requests: action.payload };
      
    case 'ADD_REQUEST':
      return { ...state, requests: [...state.requests, action.payload] };
      
    case 'UPDATE_REQUEST':
      return {
        ...state,
        requests: state.requests.map(request =>
          request.id === action.payload.id
            ? { ...request, ...action.payload.updates }
            : request
        )
      };
      
    case 'DELETE_REQUEST':
      return {
        ...state,
        requests: state.requests.filter(request => request.id !== action.payload)
      };
      
    case 'SET_SHIFT_STATUS':
      return { ...state, shiftStatus: action.payload };
      
    case 'SET_CURRENT_STAFF_ID':
      return { ...state, currentStaffId: action.payload };
      
    case 'ADD_TOAST':
      const newToast: ToastMessage = {
        id: Date.now(),
        ...action.payload
      };
      return { ...state, toasts: [...state.toasts, newToast] };
      
    case 'REMOVE_TOAST':
      return {
        ...state,
        toasts: state.toasts.filter(toast => toast.id !== action.payload)
      };
      
    case 'LOAD_DATA':
      return { ...state, ...action.payload };
      
    default:
      return state;
  }
};

// Context type
interface AppContextType {
  state: ExtendedAppState;
  dispatch: React.Dispatch<AppAction>;
  
  // Staff actions
  setStaff: (staff: Staff[]) => void;
  addStaff: (staff: Staff) => void;
  updateStaff: (id: string, updates: Partial<Staff>) => void;
  deleteStaff: (id: string) => void;
  
  // Store settings actions
  setStoreSettings: (settings: StoreSettings) => void;
  
  // Shift actions
  setShifts: (shifts: Shifts) => void;
  updateShift: (date: string, shifts: { morning: string[]; evening: string[] }) => void;
  
  // Request actions
  setRequests: (requests: ShiftRequest[]) => void;
  addRequest: (request: ShiftRequest) => void;
  updateRequest: (id: string, updates: Partial<ShiftRequest>) => void;
  deleteRequest: (id: string) => void;
  
  // App state actions
  setShiftStatus: (status: ShiftStatus) => void;
  setCurrentStaffId: (id: string | null) => void;
  
  // Toast actions
  showToast: (message: string, type?: ToastType) => void;
  removeToast: (id: number) => void;
  
  // Data management
  loadData: () => void;
  saveData: () => void;
  exportData: () => string;
  importData: (data: string) => void;
  clearData: () => void;
}

// Create context
const AppContext = createContext<AppContextType | undefined>(undefined);

// Context provider
interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, getInitialState());

  // Auto-save to localStorage whenever state changes
  useEffect(() => {
    const dataToSave = {
      staff: state.staff,
      storeSettings: state.storeSettings,
      shifts: state.shifts,
      requests: state.requests,
      shiftStatus: state.shiftStatus
    };
    
    storageService.saveData(dataToSave);
  }, [state.staff, state.storeSettings, state.shifts, state.requests, state.shiftStatus]);

  // Action creators
  const actions = {
    // Staff actions
    setStaff: (staff: Staff[]) => dispatch({ type: 'SET_STAFF', payload: staff }),
    addStaff: (staff: Staff) => dispatch({ type: 'ADD_STAFF', payload: staff }),
    updateStaff: (id: string, updates: Partial<Staff>) => 
      dispatch({ type: 'UPDATE_STAFF', payload: { id, updates } }),
    deleteStaff: (id: string) => dispatch({ type: 'DELETE_STAFF', payload: id }),
    
    // Store settings actions
    setStoreSettings: (settings: StoreSettings) => 
      dispatch({ type: 'SET_STORE_SETTINGS', payload: settings }),
    
    // Shift actions
    setShifts: (shifts: Shifts) => dispatch({ type: 'SET_SHIFTS', payload: shifts }),
    updateShift: (date: string, shifts: { morning: string[]; evening: string[] }) =>
      dispatch({ type: 'UPDATE_SHIFT', payload: { date, shifts } }),
    
    // Request actions
    setRequests: (requests: ShiftRequest[]) => 
      dispatch({ type: 'SET_REQUESTS', payload: requests }),
    addRequest: (request: ShiftRequest) => 
      dispatch({ type: 'ADD_REQUEST', payload: request }),
    updateRequest: (id: string, updates: Partial<ShiftRequest>) => 
      dispatch({ type: 'UPDATE_REQUEST', payload: { id, updates } }),
    deleteRequest: (id: string) => dispatch({ type: 'DELETE_REQUEST', payload: id }),
    
    // App state actions
    setShiftStatus: (status: ShiftStatus) => 
      dispatch({ type: 'SET_SHIFT_STATUS', payload: status }),
    setCurrentStaffId: (id: string | null) => 
      dispatch({ type: 'SET_CURRENT_STAFF_ID', payload: id }),
    
    // Toast actions
    showToast: (message: string, type: ToastType = 'success') => 
      dispatch({ type: 'ADD_TOAST', payload: { message, type } }),
    removeToast: (id: number) => dispatch({ type: 'REMOVE_TOAST', payload: id }),
    
    // Data management
    loadData: () => {
      const data = storageService.loadData();
      dispatch({ type: 'LOAD_DATA', payload: data });
    },
    
    saveData: () => {
      const dataToSave = {
        staff: state.staff,
        storeSettings: state.storeSettings,
        shifts: state.shifts,
        requests: state.requests,
        shiftStatus: state.shiftStatus
      };
      storageService.saveData(dataToSave);
    },
    
    exportData: (): string => {
      return storageService.exportData();
    },
    
    importData: (data: string) => {
      try {
        storageService.importData(data);
        const newData = storageService.loadData();
        dispatch({ type: 'LOAD_DATA', payload: newData });
        actions.showToast('データをインポートしました');
      } catch (error) {
        actions.showToast('データのインポートに失敗しました', 'error');
      }
    },
    
    clearData: () => {
      storageService.clearData();
      const newData = storageService.loadData();
      dispatch({ type: 'LOAD_DATA', payload: newData });
      actions.showToast('データをリセットしました');
    }
  };

  const contextValue: AppContextType = {
    state,
    dispatch,
    ...actions
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook to use the context
export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

export default AppContext;