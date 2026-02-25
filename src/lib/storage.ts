import type { ApiKeys } from '../types/meeting';

const API_KEY = 'notulenai_api_keys';

export function loadKeys(): ApiKeys | null {
  try {
    const raw = localStorage.getItem(API_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveKeys(keys: ApiKeys): void {
  localStorage.setItem(API_KEY, JSON.stringify(keys));
}
