import { 
  Staff, 
  StoreSettings, 
  ShiftRequest, 
  AIShiftGenerationRequest, 
  AIShiftGenerationResponse,
  APIResponse
} from '@/types';
import config from '@/config';

interface GeminiAPIResponse {
  candidates?: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
  error?: {
    code: number;
    message: string;
  };
}

class GeminiService {
  private baseUrl: string;
  private model: string;
  private retryAttempts = 3;
  private retryDelay = 1000; // 1 second

  constructor() {
    this.baseUrl = config.get('gemini').baseUrl;
    this.model = config.get('gemini').model;
  }

  /**
   * Generate shifts using Gemini AI
   */
  async generateShifts(request: AIShiftGenerationRequest): Promise<APIResponse<AIShiftGenerationResponse>> {
    try {
      if (!config.isGeminiConfigured()) {
        throw new Error('Gemini API key is not configured');
      }

      const prompt = this.createShiftGenerationPrompt(request);
      const response = await this.callGeminiAPI(prompt);

      if (!response.success || !response.data) {
        return {
          success: false,
          error: response.error
        };
      }

      const aiResponse = this.parseShiftGenerationResponse(response.data);
      
      return {
        success: true,
        data: aiResponse
      };

    } catch (error) {
      console.error('Gemini shift generation error:', error);
      return {
        success: false,
        error: {
          code: 'GEMINI_ERROR',
          message: error instanceof Error ? error.message : 'AI shift generation failed',
          details: error,
          timestamp: new Date()
        }
      };
    }
  }

  /**
   * Create a comprehensive prompt for shift generation
   */
  private createShiftGenerationPrompt(request: AIShiftGenerationRequest): string {
    const { dateRange, staffList, storeSettings, requests, constraints } = request;

    // Convert dates to readable format
    const startDate = new Date(dateRange.startDate).toLocaleDateString('ja-JP');
    const endDate = new Date(dateRange.endDate).toLocaleDateString('ja-JP');

    // Organize staff by roles
    const staffByRole = this.organizeStaffByRole(staffList);
    
    // Format staff preferences and requests
    const staffPreferences = this.formatStaffPreferences(requests);
    
    // Format minimum requirements
    const weeklyRequirements = this.formatWeeklyRequirements(storeSettings);

    const prompt = `
あなたは美容院のシフト管理システムの専門家です。以下の条件に基づいて最適なシフトを作成してください。

## 基本情報
- 期間: ${startDate} から ${endDate}
- 営業時間: ${storeSettings.openTime} - ${storeSettings.closeTime}
- 早番: ${storeSettings.shifts.morning.start} - ${storeSettings.shifts.morning.end}
- 遅番: ${storeSettings.shifts.evening.start} - ${storeSettings.shifts.evening.end}

## スタッフ情報
${staffByRole}

## 最低必要人数（曜日別）
${weeklyRequirements}

## スタッフの希望・制約
${staffPreferences}

## 制約条件
- 各シフトの最低必要人数を満たすこと
- 最大連続勤務日数: ${constraints.maxConsecutiveDays}日
- シフト間の最低休憩日数: ${constraints.restDaysBetweenShifts}日
- スタッフの休み希望を最大限考慮すること
- 経験豊富なスタッフ（スタイリスト）を適切に配置すること
- アシスタントとスタイリストのバランスを保つこと

## 出力形式
以下のJSON形式で回答してください。日付はYYYY-MM-DD形式で出力してください。

{
  "success": true,
  "shifts": {
    "2024-01-01": {
      "morning": ["staff_id1", "staff_id2"],
      "evening": ["staff_id3", "staff_id4"]
    }
  },
  "summary": "シフト作成の概要と考慮した点を日本語で説明",
  "conflicts": [
    {
      "date": "2024-01-01",
      "issue": "問題の説明",
      "severity": "high|medium|low",
      "suggestions": ["解決策1", "解決策2"]
    }
  ],
  "optimization_score": 85
}

重要: 
1. スタッフIDは提供されたIDを正確に使用してください
2. 曜日の最低必要人数を必ず満たしてください
3. スタッフの希望を可能な限り考慮してください
4. 現実的で実行可能なシフトを作成してください
5. 必ずJSON形式のみで回答してください（説明文は含めないでください）
`;

    return prompt;
  }

  /**
   * Organize staff by role for better prompt readability
   */
  private organizeStaffByRole(staffList: Staff[]): string {
    const roles = ['スタイリスト', 'アシスタント', 'レセプショニスト', 'ネイリスト'] as const;
    
    return roles.map(role => {
      const staffInRole = staffList.filter(staff => staff.role === role);
      if (staffInRole.length === 0) return '';
      
      const staffNames = staffInRole.map(staff => `${staff.name}(ID: ${staff.id})`).join(', ');
      return `${role}: ${staffNames}`;
    }).filter(line => line).join('\n');
  }

  /**
   * Format staff preferences and requests
   */
  private formatStaffPreferences(requests: ShiftRequest[]): string {
    if (requests.length === 0) {
      return '特別な希望はありません';
    }

    const groupedRequests = requests.reduce((acc, request) => {
      if (!acc[request.staffId]) {
        acc[request.staffId] = [];
      }
      acc[request.staffId].push(request);
      return acc;
    }, {} as Record<string, ShiftRequest[]>);

    return Object.entries(groupedRequests).map(([staffId, staffRequests]) => {
      const requestStrings = staffRequests.map(req => {
        const date = new Date(req.date).toLocaleDateString('ja-JP');
        const typeMap = {
          'off': '休み',
          'morning': '早番希望',
          'evening': '遅番希望',
          'any': '指定なし'
        };
        return `${date}: ${typeMap[req.type]}`;
      }).join(', ');
      
      return `スタッフID ${staffId}: ${requestStrings}`;
    }).join('\n');
  }

  /**
   * Format weekly minimum requirements
   */
  private formatWeeklyRequirements(settings: StoreSettings): string {
    const dayNames = ['月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日', '日曜日'];
    
    return settings.minStaff.map((requirement, index) => {
      return `${dayNames[index]}: 早番${requirement.morning}人、遅番${requirement.evening}人`;
    }).join('\n');
  }

  /**
   * Call Gemini API with retry logic
   */
  private async callGeminiAPI(prompt: string): Promise<APIResponse<string>> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        const url = config.getFullGeminiUrl(`models/${this.model}:generateContent`);
        
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: prompt
              }]
            }],
            generationConfig: {
              temperature: 0.1, // Low temperature for consistent, logical outputs
              topK: 1,
              topP: 0.8,
              maxOutputTokens: 4096,
            },
            safetySettings: [
              {
                category: "HARM_CATEGORY_HARASSMENT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
              },
              {
                category: "HARM_CATEGORY_HATE_SPEECH",
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
              }
            ]
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const data: GeminiAPIResponse = await response.json();

        if (data.error) {
          throw new Error(`Gemini API Error: ${data.error.message}`);
        }

        if (!data.candidates || data.candidates.length === 0) {
          throw new Error('No response from Gemini API');
        }

        const generatedText = data.candidates[0].content.parts[0].text;
        
        return {
          success: true,
          data: generatedText
        };

      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        
        if (attempt < this.retryAttempts) {
          console.warn(`Gemini API attempt ${attempt} failed, retrying...`, error);
          await this.delay(this.retryDelay * attempt);
        }
      }
    }

    return {
      success: false,
      error: {
        code: 'GEMINI_API_ERROR',
        message: lastError?.message || 'Failed to call Gemini API after multiple attempts',
        details: lastError,
        timestamp: new Date()
      }
    };
  }

  /**
   * Parse Gemini response and convert to structured data
   */
  private parseShiftGenerationResponse(responseText: string): AIShiftGenerationResponse {
    try {
      // Clean the response text (remove markdown code blocks if present)
      const cleanedText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      const parsed = JSON.parse(cleanedText);
      
      // Validate required fields
      if (!parsed.success || !parsed.shifts || !parsed.summary) {
        throw new Error('Invalid response format from Gemini');
      }

      return {
        success: parsed.success,
        shifts: parsed.shifts,
        summary: parsed.summary,
        conflicts: parsed.conflicts || [],
        optimization_score: parsed.optimization_score || 0
      };

    } catch (error) {
      console.error('Failed to parse Gemini response:', error);
      console.log('Raw response:', responseText);
      
      // Return a fallback response
      return {
        success: false,
        shifts: {},
        summary: 'AIレスポンスの解析に失敗しました。手動でシフトを作成してください。',
        conflicts: [{
          date: new Date().toISOString().split('T')[0],
          issue: 'API応答の解析エラー',
          severity: 'high',
          suggestions: ['手動でシフトを作成してください']
        }],
        optimization_score: 0
      };
    }
  }

  /**
   * Test API connection
   */
  async testConnection(): Promise<APIResponse<boolean>> {
    try {
      if (!config.isGeminiConfigured()) {
        return {
          success: false,
          error: {
            code: 'NO_API_KEY',
            message: 'Gemini API key is not configured',
            timestamp: new Date()
          }
        };
      }

      const testPrompt = 'こんにちは。これはAPI接続テストです。「接続成功」と返答してください。';
      const response = await this.callGeminiAPI(testPrompt);
      
      return {
        success: response.success,
        data: response.success,
        error: response.error
      };

    } catch (error) {
      return {
        success: false,
        error: {
          code: 'CONNECTION_TEST_FAILED',
          message: error instanceof Error ? error.message : 'Connection test failed',
          details: error,
          timestamp: new Date()
        }
      };
    }
  }

  /**
   * Delay utility for retry logic
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get API usage information (if available)
   */
  getAPIInfo(): { configured: boolean; model: string; baseUrl: string } {
    return {
      configured: config.isGeminiConfigured(),
      model: this.model,
      baseUrl: this.baseUrl
    };
  }

  /**
   * Update API configuration
   */
  updateConfig(newApiKey: string): void {
    config.setGeminiApiKey(newApiKey);
  }
}

// Export singleton instance
export const geminiService = new GeminiService();
export default geminiService;