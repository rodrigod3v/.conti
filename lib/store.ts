import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

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

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'Administrador' | 'Contador' | 'Visualizador';
  status: 'Ativo' | 'Inativo';
}

export interface Company {
  id: string;
  name: string;
  cnpj?: string;
  status: 'Ativo' | 'Inativo';
}

interface AppState {
  fileData: DataRow[];
  headers: string[];
  fileName: string | null;
  fileId: string | null;
  comments: Record<string, Comment[]>;
  config: {
      team: TeamMember[];
      statusColors: Record<string, string>;
      companies: Company[];
  };
  sheets: Record<string, { data: DataRow[], headers: string[] }>;
  activeSheet: string | null;
  setFileData: (data: DataRow[], headers: string[], fileName: string, fileId?: string | null) => void;
  setSheets: (sheets: Record<string, { data: DataRow[], headers: string[] }>, fileName: string, fileId?: string | null) => void;
  changeSheet: (sheetName: string) => void;
  updateCell: (rowIndex: number, column: string, value: string | number) => void;
  addRow: (row: DataRow) => void;
  deleteRow: (rowIndex: number) => void;
  addComment: (caseId: string, text: string, user: string) => void;
  clearData: () => void;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  
  // Config Actions
  addTeamMember: (member: Omit<TeamMember, 'id'>) => void;
  removeTeamMember: (id: string) => void;
  updateStatusColor: (status: string, color: string) => void;
  addCompany: (company: Omit<Company, 'id'>) => void;
  removeCompany: (id: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      fileData: [],
      headers: [],
      fileName: null,
      fileId: null,
      comments: {},
      config: {
          team: [],
          statusColors: {},
          companies: []
      },
      sheets: {},
      activeSheet: null,
      setFileData: (data, headers, fileName, fileId = null) => set({ 
          fileData: data, 
          headers, 
          fileName, 
          fileId,
          // When setting single file data (legacy or CSV), we treat it as a single sheet named "Principal"
          sheets: { "Principal": { data, headers } },
          activeSheet: "Principal"
      }),
      setSheets: (sheets, fileName, fileId = null) => {
          const firstSheetName = Object.keys(sheets)[0];
          set({
              sheets,
              fileName,
              fileId,
              activeSheet: firstSheetName,
              fileData: sheets[firstSheetName]?.data || [],
              headers: sheets[firstSheetName]?.headers || []
          });
      },
      changeSheet: (sheetName) => set((state) => {
          const sheet = state.sheets[sheetName];
          if (!sheet) return {};
          return {
              activeSheet: sheetName,
              fileData: sheet.data,
              headers: sheet.headers
          };
      }),
      updateCell: (rowIndex, column, value) =>
        set((state) => {
          const newData = [...state.fileData];
          newData[rowIndex] = { ...newData[rowIndex], [column]: value };
          
          // Sync back to sheets map if we have an active sheet
          const newSheets = { ...state.sheets };
          if (state.activeSheet && newSheets[state.activeSheet]) {
              newSheets[state.activeSheet] = {
                  ...newSheets[state.activeSheet],
                  data: newData
              };
          }
          
          return { fileData: newData, sheets: newSheets };
        }),
      addRow: (row) =>
        set((state) => {
            const newData = [row, ...state.fileData];
            
            // Sync back to sheets map
            const newSheets = { ...state.sheets };
            if (state.activeSheet && newSheets[state.activeSheet]) {
                newSheets[state.activeSheet] = {
                    ...newSheets[state.activeSheet],
                    data: newData
                };
            }

            return { fileData: newData, sheets: newSheets };
        }),
      deleteRow: (rowIndex) =>
        set((state) => {
            const newData = [...state.fileData];
            newData.splice(rowIndex, 1);

            // Sync back to sheets map
            const newSheets = { ...state.sheets };
            if (state.activeSheet && newSheets[state.activeSheet]) {
                newSheets[state.activeSheet] = {
                    ...newSheets[state.activeSheet],
                    data: newData
                };
            }

            return { fileData: newData, sheets: newSheets };
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
      clearData: () => set({ fileData: [], headers: [], fileName: null, fileId: null, comments: {}, config: { team: [], statusColors: {}, companies: [] }, sheets: {}, activeSheet: null }),
      isSidebarOpen: true,
      toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),

      // Config Actions Implementation
      addTeamMember: (member) => set((state) => ({
          config: {
              ...state.config,
              team: [...state.config.team, { ...member, id: Math.random().toString(36).substr(2, 9) }]
          }
      })),
      removeTeamMember: (id) => set((state) => ({
          config: {
              ...state.config,
              team: state.config.team.filter(m => m.id !== id)
          }
      })),
      updateStatusColor: (status, color) => set((state) => ({
          config: {
              ...state.config,
              statusColors: { ...state.config.statusColors, [status]: color }
          }
      })),
      addCompany: (company) => set((state) => ({
          config: {
              ...state.config,
              companies: [...state.config.companies, { ...company, id: Math.random().toString(36).substr(2, 9) }]
          }
      })),
      removeCompany: (id) => set((state) => ({
          config: {
              ...state.config,
              companies: state.config.companies.filter(c => c.id !== id)
          }
      })),
    }),
    {
      name: 'conti-storage', // unique name
      storage: createJSONStorage(() => localStorage),
    }
  )
);
