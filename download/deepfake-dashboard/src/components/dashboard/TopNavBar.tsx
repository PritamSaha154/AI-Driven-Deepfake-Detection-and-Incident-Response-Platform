'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Shield, LogOut, ChevronDown } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAppStore } from '@/store/useAppStore';

function TopNavBarComponent() {
  const { currentUser } = useAppStore();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [nodeLocation, setNodeLocation] = useState('DETECTING NODE...');

  useEffect(() => {
    // Ticking clock interval
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    
    // Dynamically detect the user's timezone region
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      // Converts "Asia/Kolkata" to "NODE: ASIA - KOLKATA"
      setNodeLocation(`NODE: ${tz.toUpperCase().replace('/', ' - ')}`);
    } catch (e) {
      setNodeLocation('NODE: LOCALHOST');
    }

    return () => clearInterval(timer);
  }, []);

  const formatDateTime = (date: Date) => {
    return date.toLocaleString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric',
      year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between fixed top-0 left-0 right-0 z-50 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-red-600 rounded-lg shadow-sm"><Shield className="w-5 h-5 text-white" /></div>
        <div>
            <h1 className="text-lg font-bold text-gray-900 leading-none">VeriFake Forensic SOC</h1>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1 font-bold">Deepfake Detection</p>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="text-right hidden md:block border-r border-gray-200 pr-6 min-w-[220px]">
          {/* Added font-mono to prevent text jittering when seconds tick */}
          <p className="text-sm font-bold text-gray-700 font-mono">{formatDateTime(currentTime)}</p>
          <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">{nodeLocation}</p>
        </div>
        <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
                {/* Explicitly hardcoded to Pritam Saha for the demo */}
                <p className="text-sm font-bold text-gray-800">Pritam Saha</p>
                <p className="text-[10px] text-gray-500 font-medium">BCA Lead Investigator</p>
            </div>
            <Avatar className="h-9 w-9 border-2 border-red-50 shadow-sm">
                <AvatarFallback className="bg-red-600 text-white font-bold text-sm">PS</AvatarFallback>
            </Avatar>
        </div>
      </div>
    </header>
  );
}

export const TopNavBar = dynamic(() => Promise.resolve(TopNavBarComponent), {
  ssr: false,
});