// src/store/useAppStore.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export interface Profile {
  nom: string;
  echantillons: number;
  ajoute?: string;
}

export interface AnalysisOptions {
  stt: boolean;
  modele: 'tiny' | 'base' | 'small';
  langue: 'fr' | 'en' | 'ar' | 'es' | 'auto';
  fenetre: number;
  seuil: number;
  ecart: number;
  classification: boolean;
  sound_threshold: number;
  moderate_dbfs: number;
  high_dbfs: number;
  alert_seconds: number;
  professeur?: string;
  classe?: string;
  matiere?: string;
  salle?: string;
  seance?: string;
}

export interface ScheduleItem {
  id: string;
  professeur: string;
  classe: string;
  matiere: string;
  salle: string;
  semestre: string;
  semaine: string;
  jour: string;
  debut: string;
  fin: string;
}

export interface AnalysisSession {
  id: string;
  date: string;
  duree: number;
}

interface AppState {
  // Options persistées
  options: AnalysisOptions;
  setOptions: (options: Partial<AnalysisOptions>) => void;
  resetOptions: () => void;

  // Emploi du temps
  schedule: ScheduleItem[];
  addSchedule: (item: ScheduleItem) => void;
  removeSchedule: (id: string) => void;

  // État runtime
  profiles: Profile[];
  setProfiles: (profiles: Profile[]) => void;
  sessions: AnalysisSession[];
  setSessions: (sessions: AnalysisSession[]) => void;
  
  // Sélection courante
  currentResult: any | null;
  setCurrentResult: (result: any | null) => void;
  selectedFrameIndex: number;
  setSelectedFrameIndex: (index: number) => void;
  selectedScheduleId: string;
  setSelectedScheduleId: (id: string) => void;

  // API
  apiBaseUrl: string;
  setApiBaseUrl: (url: string) => void;
}

export const DEFAULT_OPTIONS: AnalysisOptions = {
  stt: true,
  modele: 'base',
  langue: 'fr',
  fenetre: 3,
  seuil: 0.68,
  ecart: 0.05,
  classification: true,
  sound_threshold: 0.3,
  moderate_dbfs: -35,
  high_dbfs: -20,
  alert_seconds: 3,
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      options: DEFAULT_OPTIONS,
      setOptions: (partial) =>
        set((state) => ({ options: { ...state.options, ...partial } })),
      resetOptions: () => set({ options: DEFAULT_OPTIONS }),

      schedule: [],
      addSchedule: (item) =>
        set((state) => ({ schedule: [...state.schedule, item] })),
      removeSchedule: (id) =>
        set((state) => ({
          schedule: state.schedule.filter((s) => s.id !== id),
        })),

      profiles: [],
      setProfiles: (profiles) => set({ profiles }),

      sessions: [],
      setSessions: (sessions) => set({ sessions }),

      currentResult: null,
      setCurrentResult: (result) => set({ currentResult: result }),
      selectedFrameIndex: 0,
      setSelectedFrameIndex: (index) => set({ selectedFrameIndex: index }),
      selectedScheduleId: '',
      setSelectedScheduleId: (id) => set({ selectedScheduleId: id }),

      apiBaseUrl: 'http://192.168.1.117:8000',
      setApiBaseUrl: (url) => set({ apiBaseUrl: url }),
    }),
    {
      name: 'voicescope-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        options: state.options,
        schedule: state.schedule,
        apiBaseUrl: state.apiBaseUrl,
      }),
    },
  ),
);