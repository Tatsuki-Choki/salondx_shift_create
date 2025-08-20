// Staff Management Types
export interface Staff {
  id: string;
  name: string;
  role: StaffRole;
  email?: string;
  phone?: string;
  startDate?: Date;
  preferences?: StaffPreferences;
}

export type StaffRole = 'スタイリスト' | 'アシスタント' | 'レセプショニスト' | 'ネイリスト';

export interface StaffPreferences {
  preferredShifts: ShiftType[];
  unavailableDays: number[];
  maxConsecutiveDays: number;
}

// Shift Management Types
export interface ShiftAssignment {
  morning: string[]; // Staff IDs
  evening: string[]; // Staff IDs
}

export interface Shifts {
  [date: string]: ShiftAssignment;
}

export type ShiftType = 'morning' | 'evening';

export interface ShiftTime {
  start: string;
  end: string;
}

// Store Settings Types
export interface StoreSettings {
  openTime: string;
  closeTime: string;
  shifts: {
    morning: ShiftTime;
    evening: ShiftTime;
  };
  minStaff: DailyStaffRequirement[];
}

export interface DailyStaffRequirement {
  morning: number;
  evening: number;
}

// Request Management Types
export interface ShiftRequest {
  id: string;
  staffId: string;
  date: string;
  type: RequestType;
  reason?: string;
  priority: RequestPriority;
  submitted: Date;
  status: RequestStatus;
}

export type RequestType = 'off' | 'morning' | 'evening' | 'any';
export type RequestPriority = 'low' | 'medium' | 'high';
export type RequestStatus = 'pending' | 'approved' | 'denied';

// Application State Types
export interface AppState {
  staff: Staff[];
  storeSettings: StoreSettings;
  shifts: Shifts;
  requests: ShiftRequest[];
  shiftStatus: ShiftStatus;
  currentStaffId: string | null;
}

export type ShiftStatus = 'draft' | 'confirmed';

// UI Component Types
export interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
}

export type ToastType = 'success' | 'error' | 'warning';

export type ViewMode = 'month' | 'week';

// AI Integration Types
export interface AIShiftGenerationRequest {
  dateRange: {
    startDate: string;
    endDate: string;
  };
  staffList: Staff[];
  storeSettings: StoreSettings;
  requests: ShiftRequest[];
  constraints: ShiftConstraints;
}

export interface ShiftConstraints {
  minStaffPerShift: { [key: string]: number };
  maxConsecutiveDays: number;
  restDaysBetweenShifts: number;
}

export interface AIShiftGenerationResponse {
  success: boolean;
  shifts: Shifts;
  summary: string;
  conflicts?: ConflictReport[];
  optimization_score: number;
}

export interface ConflictReport {
  date: string;
  issue: string;
  severity: 'low' | 'medium' | 'high';
  suggestions: string[];
}

// Theme and Design Types
export interface Theme {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    success: string;
    warning: string;
    error: string;
    gray: {
      [key: string]: string;
    };
  };
  shadows: {
    [key: string]: string;
  };
}

// Utility Types
export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  hasRequests: boolean;
  shiftAssignments: ShiftAssignment;
}

// Configuration Types
export interface Config {
  gemini: {
    apiKey: string;
    baseUrl: string;
    model: string;
  };
  app: {
    name: string;
    version: string;
    locale: string;
  };
}

// Error Types
export interface AppError {
  code: string;
  message: string;
  details?: unknown;
  timestamp: Date;
}

// API Response Types
export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: AppError;
}

// Form Types
export interface FormValidation {
  isValid: boolean;
  errors: { [field: string]: string };
}

export interface StaffFormData {
  name: string;
  role: StaffRole;
  email?: string;
  phone?: string;
}

export interface RequestFormData {
  date: string;
  type: RequestType;
  reason?: string;
  priority: RequestPriority;
}