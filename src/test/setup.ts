import '@testing-library/jest-dom';

// Mock localStorage
const localStorageMock = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
  clear: () => {},
  length: 0,
  key: () => null,
} as Storage;

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true
});

// Mock window.confirm
Object.defineProperty(global, 'confirm', {
  value: () => true,
  writable: true
});

// Mock window.alert
Object.defineProperty(global, 'alert', {
  value: () => {},
  writable: true
});

// Mock console methods to reduce noise in tests
const originalConsole = global.console;
Object.defineProperty(global, 'console', {
  value: {
    ...originalConsole,
    warn: () => {},
    error: () => {},
  },
  writable: true
});