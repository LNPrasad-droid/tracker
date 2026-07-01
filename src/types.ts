/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Core Data Models for Leo OS (Futuristic Personal Productivity System)

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: 'study' | 'work' | 'personal' | 'health' | 'finance' | 'other';
  dueDate?: string; // ISO Date String
  completed: boolean;
  completedAt?: string;
  projectId?: string; // Optional relation to Project
  milestoneId?: string; // Optional relation to Milestone
  createdAt: string;
}

export interface StudySession {
  id: string;
  subject: string;
  topic?: string;
  duration: number; // in minutes
  date: string; // YYYY-MM-DD
  difficulty: 'easy' | 'medium' | 'hard';
  notes?: string;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  status: 'planning' | 'active' | 'paused' | 'completed';
  dueDate?: string;
  progress: number; // Percentage 0 - 100
  notes?: string;
  createdAt: string;
}

export interface Milestone {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  dueDate?: string;
  completed: boolean;
  completedAt?: string;
}

export interface Habit {
  id: string;
  name: string;
  frequency: 'daily' | 'weekly';
  createdAt: string;
  streakCurrent: number;
  streakMax: number;
  lastCompletedDate?: string; // YYYY-MM-DD
}

export interface HabitLog {
  id: string;
  habitId: string;
  date: string; // YYYY-MM-DD
  completed: boolean;
}

export interface JournalEntry {
  id: string;
  title: string;
  content: string; // Markdown supported
  mood?: 'excellent' | 'good' | 'neutral' | 'low' | 'exhausted';
  tags: string[];
  createdAt: string; // ISO Date String
  date: string; // YYYY-MM-DD
}

export interface SystemSettings {
  userName: string;
  themeColor: 'blue' | 'cyan' | 'emerald' | 'amber' | 'rose' | 'violet';
  soundEnabled: boolean;
  autoSaveCloud: boolean;
  quickNote?: string;
}

export interface LeoOSState {
  tasks: Task[];
  studySessions: StudySession[];
  projects: Project[];
  milestones: Milestone[];
  habits: Habit[];
  habitLogs: HabitLog[];
  journalEntries: JournalEntry[];
  settings: SystemSettings;
}
