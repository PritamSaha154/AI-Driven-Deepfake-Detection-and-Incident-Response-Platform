import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { ViewType, CaseRecord, User } from '@/types';
import { currentUser, cases as mockCases } from '@/lib/mock-data';

// Helper function for ISO / Forensic SOC Short-Date Format (e.g. "Jul 22, 15:04:32")
const getFormattedLogTime = () => {
  const now = new Date();
  const month = now.toLocaleString('en-US', { month: 'short' });
  const day = now.getDate();
  const time = now.toLocaleTimeString('en-GB', { hour12: false }); // 24-hour time
  return `${month} ${day}, ${time}`;
};

interface AppState {
  currentView: ViewType;
  setCurrentView: (view: ViewType) => void;
  selectedCase: CaseRecord | null;
  setSelectedCase: (caseRecord: CaseRecord | null) => void;
  currentUser: User;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  riskFilter: string;
  setRiskFilter: (filter: string) => void;
  analystFilter: string;
  setAnalystFilter: (filter: string) => void;
  uploadedImage: string | null;
  setUploadedImage: (image: string | null) => void;
  analysisResult: CaseRecord | null;
  setAnalysisResult: (result: CaseRecord | null) => void;
  isAnalyzing: boolean;
  setIsAnalyzing: (analyzing: boolean) => void;
  historyCases: CaseRecord[];
  addCaseToHistory: (caseRecord: CaseRecord) => void;
  getFilteredCases: () => CaseRecord[];

  // --- NEW INCIDENT RESPONSE SYSTEM STATE ---
  irProtocols: {
    hashCheck: boolean;
    sanitization: boolean;
    autoLock: boolean;
    nodeSync: boolean;
  };
  setProtocol: (protocol: string, value: boolean) => void;
  systemLogs: string[];
  addLog: (message: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentView: 'dashboard',
      setCurrentView: (view) => set({ currentView: view }),
      selectedCase: null,
      setSelectedCase: (caseRecord) => set({ 
        selectedCase: caseRecord, 
        currentView: caseRecord ? 'reports' : get().currentView 
      }),
      currentUser,
      sidebarOpen: true,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      searchQuery: '',
      setSearchQuery: (query) => set({ searchQuery: query }),
      riskFilter: 'all',
      setRiskFilter: (filter) => set({ riskFilter: filter }),
      analystFilter: '',
      setAnalystFilter: (filter) => set({ analystFilter: filter }),
      uploadedImage: null,
      setUploadedImage: (image) => set({ uploadedImage: image }),
      analysisResult: null,
      setAnalysisResult: (result) => set({ analysisResult: result }),
      isAnalyzing: false,
      setIsAnalyzing: (analyzing) => set({ isAnalyzing: analyzing }),
      
      // --- HISTORY LOGIC ---
      historyCases: [], 
      addCaseToHistory: (caseRecord) => {
        const statusLabel = caseRecord.status.toUpperCase();
        get().addLog(`ARCHIVE_VAULT: Case ${caseRecord.caseId} committed to storage with status [${statusLabel}]`);

        set((state) => ({ 
          historyCases: [caseRecord, ...state.historyCases] 
        }));
      },

      getFilteredCases: () => {
        const { searchQuery, riskFilter, analystFilter, historyCases } = get();
        const allAvailableCases = historyCases.length > 0 ? historyCases : mockCases;
        return allAvailableCases.filter((c) => {
          const matchesSearch = searchQuery === '' || 
            c.caseId.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.imageName.toLowerCase().includes(searchQuery.toLowerCase());
          const matchesRisk = riskFilter === 'all' || c.riskLevel.toUpperCase() === riskFilter.toUpperCase();
          const matchesAnalyst = analystFilter === '' || c.analystName === analystFilter;
          return matchesSearch && matchesRisk && matchesAnalyst;
        });
      },

      // --- INCIDENT RESPONSE LOGIC ---
      irProtocols: {
        hashCheck: true,
        sanitization: false,
        autoLock: true,
        nodeSync: true,
      },
      setProtocol: (protocol, value) => {
        const protocols = get().irProtocols;
        set({ irProtocols: { ...protocols, [protocol]: value } });
        get().addLog(`PROTOCOL_UPDATE: ${protocol.toUpperCase()} set to ${value}`);
      },
      systemLogs: [
        `[${getFormattedLogTime()}] SOC_KERNEL: VeriFake Engine 1.0.0 (Next.js 16.2 + PyTorch ViT) Initialized`,
        `[${getFormattedLogTime()}] NODE_SYNC: West Bengal Command Center Connected`
      ],
      addLog: (message) => set((state) => ({
        systemLogs: [`[${getFormattedLogTime()}] ${message}`, ...state.systemLogs].slice(0, 50)
      })),
    }),
    {
      name: 'verifake-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        currentView: state.currentView,
        sidebarOpen: state.sidebarOpen,
        irProtocols: state.irProtocols,
        systemLogs: state.systemLogs,
        historyCases: state.historyCases
      }),
    }
  )
);