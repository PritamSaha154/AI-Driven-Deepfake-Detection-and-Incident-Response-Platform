'use client';

import { LayoutDashboard, Upload, History, FileText, FileBarChart, Settings, Shield, Terminal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAppStore } from '@/store/useAppStore';
import { ViewType } from '@/types';

const navItems = [
  { id: 'dashboard' as ViewType, label: 'SOC Dashboard', icon: LayoutDashboard },
  { id: 'upload' as ViewType, label: 'Asset Scan', icon: Upload },
  { id: 'analysis' as ViewType, label: 'Archive View', icon: History },
  { id: 'evidence-logs' as ViewType, label: 'Evidence Vault', icon: FileText }, 
  { id: 'reports' as ViewType, label: 'IR Certificates', icon: FileBarChart },
  // FIX: Renamed label to match your IR focus
  { id: 'settings' as ViewType, label: 'IR System C2', icon: Terminal },
];

export function SidebarNav() {
  const { currentView, setCurrentView, sidebarOpen } = useAppStore();

  if (!sidebarOpen) return null;

  return (
    <aside className="w-64 bg-white border-r border-gray-200 fixed left-0 top-16 bottom-0 z-40 shadow-sm">
      <ScrollArea className="h-full py-4">
        <div className="px-4 mb-4">
            <div className="flex items-center gap-2 px-3 py-2 bg-red-50 rounded-lg border border-red-100">
                <Shield className="w-4 h-4 text-red-600" />
                <span className="text-xs font-bold text-red-700 uppercase tracking-wider">Security Active</span>
            </div>
        </div>
        <nav className="px-3 space-y-1">
          {navItems.map((item) => (
            <Button
              key={item.id}
              variant="ghost"
              className={cn(
                'w-full justify-start gap-3 h-11 px-4 font-bold transition-all', 
                currentView === item.id 
                    ? 'bg-red-50 text-red-700 hover:bg-red-100 border-l-4 border-red-600' 
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              )}
              onClick={() => setCurrentView(item.id)}
            >
              <item.icon className={cn("w-5 h-5", currentView === item.id ? "text-red-600" : "text-gray-400")} />
              <span className="text-xs uppercase tracking-tight">{item.label}</span>
            </Button>
          ))}
        </nav>
      </ScrollArea>
    </aside>
  );
}