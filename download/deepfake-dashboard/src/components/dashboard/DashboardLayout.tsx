'use client';

import { TopNavBar } from './TopNavBar';
import { SidebarNav } from './SidebarNav';
import { DashboardOverview } from './DashboardOverview';
import { useAppStore } from '@/store/useAppStore';
import { UploadPage } from '../upload/UploadPage'; 
import { AnalysisHistory } from '../evidence/AnalysisHistory';
import { EvidenceLogs } from '../evidence/EvidenceLogs';
import { ReportsPage } from '../reports/ReportsPage'; 
// FIX: Point this to your new Incident Response component
import { SettingsPage } from '../settings/SettingsPage'; 

export function DashboardLayout() {
  const { currentView, sidebarOpen } = useAppStore();

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard': return <DashboardOverview />;
      case 'upload': return <UploadPage />;
      case 'analysis': 
      case 'analysis-history': return <AnalysisHistory />;
      case 'evidence-logs': return <EvidenceLogs />;
      case 'reports': return <ReportsPage />;
      case 'settings': return <SettingsPage />; // Now renders the IR System
      default: return <DashboardOverview />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      <TopNavBar />
      <div className="flex flex-1 pt-16">
        <SidebarNav />
        <main 
          className="flex-1 transition-all duration-300 ease-in-out p-8"
          style={{ 
            marginLeft: sidebarOpen ? '16rem' : '0',
            width: sidebarOpen ? 'calc(100% - 16rem)' : '100%' 
          }}
        >
          <div className="max-w-6xl mx-auto">{renderContent()}</div>
        </main>
      </div>
    </div>
  );
}