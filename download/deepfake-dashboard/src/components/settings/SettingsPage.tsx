'use client';

import { 
  Shield, Terminal, Server, UserCheck, Key, 
  Database, Cpu, Activity, AlertCircle 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

export function SettingsPage() {
  const { irProtocols, setProtocol, systemLogs, addLog } = useAppStore();
  const [apiStatus, setApiStatus] = useState<'online' | 'offline' | 'checking'>('checking');
  
  // Ref to track status changes and prevent duplicate log entries
  const prevStatus = useRef<'online' | 'offline' | 'checking'>('checking');

  // --- HEARTBEAT LOGIC: MONITORING BACKEND CONNECTIVITY ---
  useEffect(() => {
    const controller = new AbortController();

    const checkNodeHealth = async () => {
      // If Investigator manually disables Node Sync, force offline status
      if (!irProtocols.nodeSync) {
        setApiStatus('offline');
        if (prevStatus.current !== 'offline') {
          addLog("WARN: SOC Node Sync manually disabled by Lead Investigator.");
          prevStatus.current = 'offline';
        }
        return;
      }

      try {
        // Ping the Python backend (FastAPI/Flask)
        const res = await fetch('http://127.0.0.1:8000/predict', { 
          method: 'OPTIONS', // Lightweight check for CORS/Existence
          signal: controller.signal 
        });

        // 405 (Method Not Allowed) is common for OPTIONS, but confirms server is ALIVE
        if (res.ok || res.status === 405) {
          setApiStatus('online');
          if (prevStatus.current !== 'online') {
            addLog("NODE_SYNC: Handshake verified. Forensic Node is ONLINE.");
            prevStatus.current = 'online';
          }
        }
      } catch (err) {
        setApiStatus('offline');
        if (prevStatus.current !== 'offline') {
          addLog("CRITICAL: SOC Node heartbeat failed. Check Python terminal/CORS settings.");
          prevStatus.current = 'offline';
        }
      }
    };

    // Execute health check every 5 seconds
    const interval = setInterval(checkNodeHealth, 5000);
    checkNodeHealth();

    return () => {
      clearInterval(interval);
      controller.abort();
    };
  }, [irProtocols.nodeSync, addLog]);

  const handleProtocolToggle = (key: string, value: boolean) => {
    setProtocol(key, value);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Incident Response System</h1>
          <p className="text-gray-500 text-sm">Command & Control (C2) Terminal for Lead Investigator</p>
        </div>
        <Badge className="bg-red-600 animate-pulse px-4 py-1 border-none font-bold tracking-widest">
          SOC ACTIVE
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* --- INVESTIGATOR IDENTITY --- */}
        <Card className="bg-white shadow-sm border-none overflow-hidden rounded-2xl">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2 text-red-600">
              <UserCheck className="w-5 h-5" />
              <CardTitle className="text-lg font-black uppercase">Investigator Identity</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-5 rounded-2xl bg-gray-50 border border-gray-100 relative overflow-hidden">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Lead Name</p>
              <p className="text-xl font-black text-gray-900">Pritam Saha</p>
              <p className="text-xs text-red-600 font-mono mt-1 font-bold">UUID: BCA-BWU-23-154</p>
              <div className="absolute top-0 right-0 p-2 opacity-5">
                <Shield className="w-16 h-16" />
              </div>
            </div>
            
            <div className="flex justify-between items-center px-2">
              <span className="text-sm text-gray-500 font-semibold">SOC Permissions</span>
              <Badge variant="outline" className="border-red-200 text-red-700 bg-red-50 font-bold">
                L7 Super-Admin
              </Badge>
            </div>
            
            <Separator className="bg-gray-100" />
            
            <Button 
              variant="outline" 
              className="w-full gap-2 border-gray-200 h-11 font-bold hover:bg-gray-50 transition-all active:scale-95"
              onClick={() => addLog("SECURITY_ALERT: Manual API Key Rotation Initiated.")}
            >
              <Key className="w-4 h-4 text-red-600" /> Rotate API Access Keys
            </Button>
          </CardContent>
        </Card>

        {/* --- AUTOMATED RESPONSE PROTOCOLS --- */}
        <Card className="bg-white shadow-sm border-none lg:col-span-2 rounded-2xl">
          <CardHeader>
            <div className="flex items-center gap-2 text-slate-800">
              <Shield className="w-5 h-5 text-red-600" />
              <CardTitle className="text-lg font-black uppercase">Automated Response Protocols</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {[
              { id: 'hashCheck', label: 'SHA-256 Collision Check', desc: 'Verify asset uniqueness' },
              { id: 'sanitization', label: 'Metadata Sanitization', desc: 'Auto-clean suspicious EXIF' },
              { id: 'autoLock', label: 'High-Risk Auto-Lock', desc: 'Freeze case if confidence > 90%', color: 'bg-red-600' },
              { id: 'nodeSync', label: 'SOC Node Sync', desc: 'Sync with West Bengal Node' }
            ].map((protocol) => (
              <div key={protocol.id} className="flex items-center justify-between p-5 rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-gray-50 transition-colors">
                <div className="space-y-0.5">
                  <p className="text-sm font-bold text-gray-800">{protocol.label}</p>
                  <p className="text-[11px] text-gray-400 font-medium">{protocol.desc}</p>
                </div>
                <Switch 
                  checked={(irProtocols as any)[protocol.id]} 
                  onCheckedChange={(val) => handleProtocolToggle(protocol.id, val)}
                  className={cn(protocol.color && "data-[state=checked]:bg-red-600")}
                />
              </div>
            ))}
            
          </CardContent>
        </Card>

        {/* --- NODE CONNECTIVITY --- */}
        <Card className="bg-white shadow-sm border-none rounded-2xl">
          <CardHeader>
            <div className="flex items-center gap-2 text-slate-800">
              <Server className="w-5 h-5 text-red-600" />
              <CardTitle className="text-lg font-black uppercase">Node Connectivity</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <span className="text-sm text-gray-600 font-bold">Forensic API</span>
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-2.5 h-2.5 rounded-full transition-all duration-500",
                  apiStatus === 'online' 
                    ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.7)] animate-pulse" 
                    : "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]"
                )} />
                <span className={cn(
                  "text-xs font-black font-mono tracking-tighter",
                  apiStatus === 'online' ? "text-emerald-600" : "text-red-600"
                )}>
                  {apiStatus === 'online' ? '127.0.0.1:8000' : 'NODE_OFFLINE'}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between px-2">
              <span className="text-sm text-gray-600 font-bold">DB Persistence</span>
              <span className="text-xs font-bold text-emerald-600 font-mono">CONNECTED</span>
            </div>

            <div className="flex items-center justify-between px-2">
              <span className="text-sm text-gray-600 font-bold">IR Core Version</span>
              <span className="text-xs font-mono font-black text-gray-400">v4.2.1-stable</span>
            </div>
          </CardContent>
        </Card>

        {/* --- SYSTEM LOGS TERMINAL --- */}
        <Card className="bg-slate-950 text-emerald-400 border-none shadow-2xl lg:col-span-2 overflow-hidden rounded-2xl">
          <CardHeader className="bg-slate-900 border-b border-white/5 py-4">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-500" />
              <CardTitle className="text-[10px] font-mono text-emerald-500 uppercase tracking-[0.2em] font-bold">
                IR_CORE_SYSTEM_LOGS
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-5 font-mono text-[10px] leading-relaxed opacity-90 h-52 overflow-y-auto scrollbar-hide">
            <div className="space-y-1.5">
              {systemLogs.map((log, index) => (
                <p key={index} className={cn(
                  "break-all",
                  log.includes('WARN') || log.includes('ALERT') || log.includes('CRITICAL') ? "text-yellow-400 font-bold" : 
                  log.includes('PROTOCOL_UPDATE') || log.includes('NODE_SYNC') ? "text-blue-400 font-bold" : 
                  log.includes('SUCCESS') ? "text-emerald-400" : ""
                )}>
                  {log}
                </p>
              ))}
              <p className="animate-pulse text-emerald-500 mt-2 font-black">_</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}