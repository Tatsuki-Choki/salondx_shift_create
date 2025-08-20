import { Config } from '@/types';

// Environment variable validation
const validateEnvVar = (name: string, value: string | undefined, required = true): string => {
  if (required && !value) {
    throw new Error(`Environment variable ${name} is required but not set`);
  }
  return value || '';
};

// Default configuration
const defaultConfig: Config = {
  gemini: {
    apiKey: validateEnvVar('VITE_GEMINI_API_KEY', import.meta.env.VITE_GEMINI_API_KEY, false),
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    model: 'gemini-1.5-flash',
  },
  app: {
    name: 'Salon Manager',
    version: '1.0.0',
    locale: 'ja-JP',
  },
};

// Configuration management class
class ConfigManager {
  private config: Config;

  constructor(initialConfig: Config = defaultConfig) {
    this.config = { ...initialConfig };
  }

  get<K extends keyof Config>(section: K): Config[K] {
    return this.config[section];
  }

  set<K extends keyof Config>(section: K, value: Partial<Config[K]>): void {
    this.config[section] = { ...this.config[section], ...value };
  }

  getGeminiApiKey(): string {
    const apiKey = this.config.gemini.apiKey;
    if (!apiKey) {
      throw new Error('Gemini API key is not configured. Please set VITE_GEMINI_API_KEY environment variable.');
    }
    return apiKey;
  }

  setGeminiApiKey(apiKey: string): void {
    this.config.gemini.apiKey = apiKey;
    // Save to localStorage for persistence
    localStorage.setItem('gemini_api_key', apiKey);
  }

  loadFromStorage(): void {
    const storedApiKey = localStorage.getItem('gemini_api_key');
    if (storedApiKey && !this.config.gemini.apiKey) {
      this.config.gemini.apiKey = storedApiKey;
    }
  }

  isGeminiConfigured(): boolean {
    return !!this.config.gemini.apiKey;
  }

  getFullGeminiUrl(endpoint: string): string {
    return `${this.config.gemini.baseUrl}/${endpoint}?key=${this.getGeminiApiKey()}`;
  }

  // Get all configuration (useful for debugging, excludes sensitive data)
  getPublicConfig(): Omit<Config, 'gemini'> & { gemini: Omit<Config['gemini'], 'apiKey'> & { hasApiKey: boolean } } {
    return {
      app: this.config.app,
      gemini: {
        baseUrl: this.config.gemini.baseUrl,
        model: this.config.gemini.model,
        hasApiKey: !!this.config.gemini.apiKey,
      },
    };
  }
}

// Create and export a singleton instance
export const config = new ConfigManager();

// Load configuration from storage on initialization
config.loadFromStorage();

export default config;