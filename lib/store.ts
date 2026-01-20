import { create } from 'zustand';

export interface DataRow {
  [key: string]: string | number | null;
}

interface AppState {
  fileData: DataRow[];
  headers: string[];
  fileName: string | null;
  setFileData: (data: DataRow[], headers: string[], fileName: string) => void;
  updateCell: (rowIndex: number, column: string, value: string | number) => void;
  clearData: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  fileData: [],
  headers: [],
  fileName: null,
  setFileData: (data, headers, fileName) => set({ fileData: data, headers, fileName }),
  updateCell: (rowIndex, column, value) =>
    set((state) => {
      const newData = [...state.fileData];
      newData[rowIndex] = { ...newData[rowIndex], [column]: value };
      return { fileData: newData };
    }),
  clearData: () => set({ fileData: [], headers: [], fileName: null }),
}));
