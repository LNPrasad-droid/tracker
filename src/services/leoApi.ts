import { DEFAULT_STATE } from '../data/defaultState';
import { LeoOSState } from '../types';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
export type LeoUser = 'Leo' | 'Preksha';

export const LEO_USERS: LeoUser[] = ['Leo', 'Preksha'];
export const LEO_USER_PASSWORD = '0126';

const mergeState = (state: Partial<LeoOSState> | null | undefined): LeoOSState => ({
  ...DEFAULT_STATE,
  ...(state || {}),
  settings: {
    ...DEFAULT_STATE.settings,
    ...(state?.settings || {}),
  },
});

const requestJson = async <T>(path: string, init?: RequestInit, user?: LeoUser): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(user ? {
        'X-Leo-User': user,
        'X-Leo-Password': LEO_USER_PASSWORD,
      } : {}),
      ...(init?.headers || {}),
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Leo OS API request failed: ${response.status}`);
  }

  return response.json();
};

export const leoApi = {
  async getState(user: LeoUser): Promise<LeoOSState> {
    const result = await requestJson<{ state: Partial<LeoOSState> }>('/api/state', undefined, user);
    return mergeState(result.state);
  },

  async saveState(user: LeoUser, state: LeoOSState): Promise<LeoOSState> {
    const result = await requestJson<{ state: Partial<LeoOSState> }>('/api/state', {
      method: 'PUT',
      body: JSON.stringify({ state }),
    }, user);
    return mergeState(result.state);
  },

  async getHealth(): Promise<{ ok: boolean; database: string }> {
    return requestJson('/api/health');
  },
};
