import { Staff, StoreSettings, Shifts, ShiftRequest, ShiftStatus } from '@/types';

const STORAGE_KEY = 'salonShiftData';

interface StorageData {
  staff: Staff[];
  storeSettings: StoreSettings;
  shifts: Shifts;
  requests: ShiftRequest[];
  shiftStatus: ShiftStatus;
  version: string;
}

class StorageService {
  private version = '1.0.0';

  private getDefaultData(): StorageData {
    return {
      staff: [
        { id: '1', name: '田中太郎', role: 'スタイリスト' },
        { id: '2', name: '佐藤花子', role: 'アシスタント' },
        { id: '3', name: '鈴木一郎', role: 'スタイリスト' },
        { id: '4', name: '山田美咲', role: 'ネイリスト' },
        { id: '5', name: '高橋真理', role: 'スタイリスト' },
        { id: '6', name: '伊藤健太', role: 'アシスタント' },
        { id: '7', name: '渡辺さくら', role: 'レセプショニスト' },
        { id: '8', name: '小林優子', role: 'スタイリスト' },
        { id: '9', name: '加藤大輔', role: 'アシスタント' },
        { id: '10', name: '木村愛美', role: 'ネイリスト' }
      ],
      storeSettings: {
        openTime: '09:00',
        closeTime: '20:00',
        shifts: {
          morning: { start: '09:00', end: '15:00' },
          evening: { start: '14:00', end: '20:00' }
        },
        minStaff: [
          { morning: 2, evening: 2 }, // Monday
          { morning: 2, evening: 2 }, // Tuesday
          { morning: 2, evening: 3 }, // Wednesday
          { morning: 2, evening: 3 }, // Thursday
          { morning: 3, evening: 3 }, // Friday
          { morning: 3, evening: 3 }, // Saturday
          { morning: 2, evening: 2 }  // Sunday
        ]
      },
      shifts: {},
      requests: [],
      shiftStatus: 'draft',
      version: this.version
    };
  }

  /**
   * Save data to localStorage
   */
  saveData(data: Partial<StorageData>): void {
    try {
      const currentData = this.loadData();
      const newData = { ...currentData, ...data, version: this.version };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
    } catch (error) {
      console.error('Failed to save data to localStorage:', error);
      throw new Error('データの保存に失敗しました');
    }
  }

  /**
   * Load data from localStorage
   */
  loadData(): StorageData {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        return this.getDefaultData();
      }

      const parsed = JSON.parse(stored) as StorageData;
      
      // Handle version migration if needed
      if (!parsed.version || parsed.version !== this.version) {
        return this.migrateData(parsed);
      }

      return parsed;
    } catch (error) {
      console.error('Failed to load data from localStorage:', error);
      return this.getDefaultData();
    }
  }

  /**
   * Handle data migration between versions
   */
  private migrateData(oldData: any): StorageData {
    const defaultData = this.getDefaultData();
    
    // Preserve existing data where possible
    return {
      ...defaultData,
      staff: oldData.staff || defaultData.staff,
      storeSettings: oldData.storeSettings || defaultData.storeSettings,
      shifts: oldData.shifts || defaultData.shifts,
      requests: oldData.requests || defaultData.requests,
      shiftStatus: oldData.shiftStatus || defaultData.shiftStatus,
      version: this.version
    };
  }

  /**
   * Clear all data and reset to defaults
   */
  clearData(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
    }
  }

  /**
   * Export data as JSON string
   */
  exportData(): string {
    const data = this.loadData();
    return JSON.stringify(data, null, 2);
  }

  /**
   * Import data from JSON string
   */
  importData(jsonString: string): void {
    try {
      const importedData = JSON.parse(jsonString) as StorageData;
      
      // Validate imported data structure
      this.validateImportedData(importedData);
      
      // Save imported data
      this.saveData(importedData);
    } catch (error) {
      console.error('Failed to import data:', error);
      throw new Error('インポートデータの形式が正しくありません');
    }
  }

  /**
   * Validate imported data structure
   */
  private validateImportedData(data: any): void {
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid data format');
    }

    // Basic structure validation
    const requiredFields = ['staff', 'storeSettings', 'shifts', 'requests', 'shiftStatus'];
    for (const field of requiredFields) {
      if (!(field in data)) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Validate staff array
    if (!Array.isArray(data.staff)) {
      throw new Error('Staff must be an array');
    }

    // Validate each staff member
    for (const staff of data.staff) {
      if (!staff.id || !staff.name || !staff.role) {
        throw new Error('Invalid staff data structure');
      }
    }

    // Validate store settings
    if (!data.storeSettings.openTime || !data.storeSettings.closeTime) {
      throw new Error('Invalid store settings');
    }
  }

  /**
   * Get data size in localStorage
   */
  getDataSize(): { size: number; sizeFormatted: string } {
    const data = localStorage.getItem(STORAGE_KEY) || '';
    const size = new Blob([data]).size;
    const sizeFormatted = this.formatBytes(size);
    return { size, sizeFormatted };
  }

  /**
   * Format bytes to human readable string
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Check if localStorage is available
   */
  isStorageAvailable(): boolean {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }
}

// Export singleton instance
export const storageService = new StorageService();
export default storageService;