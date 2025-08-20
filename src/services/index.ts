// Export all services from a single entry point
export { storageService } from './storage';
export { validationService } from './validation';
export { geminiService } from './gemini';

// Re-export service instances as default exports
export { default as storage } from './storage';
export { default as validation } from './validation';
export { default as gemini } from './gemini';