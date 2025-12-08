export interface AIDataSettings {
  github: boolean;
  stripe: boolean;
  slack: boolean;
  gmail: boolean;
  notion: boolean;
  assignments: boolean;
}

export const DEFAULT_AI_SETTINGS: AIDataSettings = {
  github: true,
  stripe: true,
  slack: true,
  gmail: true,
  notion: true,
  assignments: true,
};

export function getAIDataSettings(): AIDataSettings {
  try {
    const saved = localStorage.getItem('ai_data_settings');
    if (saved) {
      return { ...DEFAULT_AI_SETTINGS, ...JSON.parse(saved) };
    }
  } catch (error) {
  }
  return DEFAULT_AI_SETTINGS;
}

export function saveAIDataSettings(settings: Partial<AIDataSettings>): AIDataSettings {
  try {
    const current = getAIDataSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem('ai_data_settings', JSON.stringify(updated));
    return updated;
  } catch (error) {
    return DEFAULT_AI_SETTINGS;
  }
}

export function shouldAnalyze(dataType: keyof AIDataSettings): boolean {
  const settings = getAIDataSettings();
  return settings[dataType] !== false;
}