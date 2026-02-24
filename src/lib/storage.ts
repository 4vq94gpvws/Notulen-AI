import { Meeting, AppSettings } from '../types/meeting';

const MEETINGS_KEY = 'meeting-app-meetings';
const SETTINGS_KEY = 'meeting-app-settings';

export function loadMeetings(): Meeting[] {
  try {
    const data = localStorage.getItem(MEETINGS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveMeetings(meetings: Meeting[]) {
  localStorage.setItem(MEETINGS_KEY, JSON.stringify(meetings));
}

export function loadSettings(): AppSettings {
  try {
    const data = localStorage.getItem(SETTINGS_KEY);
    return data ? JSON.parse(data) : {
      groqApiKey: '',
      openRouterApiKey: '',
      openRouterModel: 'meta-llama/llama-3.3-70b-instruct',
    };
  } catch {
    return {
      groqApiKey: '',
      openRouterApiKey: '',
      openRouterModel: 'meta-llama/llama-3.3-70b-instruct',
    };
  }
}

export function saveSettings(settings: AppSettings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}
