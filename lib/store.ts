import { create } from 'zustand';

export interface DataRow {
  [key: string]: string | number | null;
}

export interface Comment {
  id: string;
  text: string;
  user: string;
  timestamp: string;
  avatarSeed: string;
  isReply?: boolean;
}

interface AppState {
  fileData: DataRow[];
  headers: string[];
  fileName: string | null;
  fileId: string | null;
  comments: Record<string, Comment[]>;
  setFileData: (data: DataRow[], headers: string[], fileName: string, fileId?: string | null) => void;
  updateCell: (rowIndex: number, column: string, value: string | number) => void;
  addComment: (caseId: string, text: string, user: string) => void;
  clearData: () => void;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  fileData: [],
  headers: [],
  fileName: null,
  fileId: null,
  comments: {},
  setFileData: (data, headers, fileName, fileId = null) => set({ fileData: data, headers, fileName, fileId }),
  updateCell: (rowIndex, column, value) =>
    set((state) => {
      const newData = [...state.fileData];
      newData[rowIndex] = { ...newData[rowIndex], [column]: value };
      return { fileData: newData };
    }),
  addComment: (caseId, text, user) =>
    set((state) => {
      const newComments = { ...state.comments };
      if (!newComments[caseId]) {
        newComments[caseId] = [];
      }
      
      const now = new Date();
      const timeString = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

      newComments[caseId].push({
        id: Math.random().toString(36).substr(2, 9),
        text,
        user,
        timestamp: timeString,
        avatarSeed: user,
        isReply: false // Default to false for new top-level comments
      });
      
      return { comments: newComments };
    }),
  clearData: () => set({ fileData: [], headers: [], fileName: null, fileId: null, comments: {} }),
  isSidebarOpen: true,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
}));
