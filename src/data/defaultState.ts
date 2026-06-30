import { LeoOSState } from '../types';

export const DEFAULT_STATE: LeoOSState = {
  tasks: [],
  studySessions: [],
  projects: [],
  milestones: [],
  habits: [],
  habitLogs: [],
  journalEntries: [],
  settings: {
    userName: 'Leo',
    themeColor: 'blue',
    soundEnabled: true,
    autoSaveCloud: false,
  }
};
