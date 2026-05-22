'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, Filter, Calendar, Eye, AlertTriangle, 
  ShieldCheck, Fingerprint, FileSearch, Database, ShieldAlert
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { RiskBadge } from '@/components/shared/RiskBadge';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';

export function EvidenceLogs() {
  const { setSelectedCase, getFilteredCases, setCurrentView } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState<string>('all');

  const allCases = getFilteredCases();

  const filteredLogs = useMemo(() => {
    return allCases.filter((log) => {
      const matchesSearch = searchTerm === '' || 
        log.caseId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.imageName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRisk = riskFilter === 'all' || 
        log.riskLevel.toUpperCase() === riskFilter.toUpperCase();
      return matchesSearch && matchesRisk;
    });
  }, [allCases, searchTerm, riskFilter]);

  const stats = {
    total: allCases.length,
    critical: allCases.filter(l => l.riskLevel.toUpperCase() === 'CRITICAL').length,
    high: allCases.filter(l => l.riskLevel.toUpperCase() === 'HIGH').length,
    newToday: allCases.filter(l => new Date(l.createdAt).toDateString() === new Date().toDateString()).length
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Database className="w-6 h-6 text-red-600" /> Evidence Vault Logs
          </h1>
          <p className="text-gray-500 text-sm">NIST-Compliant digital chain of custody</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono bg-red-50 text-red-700 px-3 py-1.5 rounded-full border border-red-100">
          <Fingerprint className="w-3 h-3" /> SOC STATUS: MONITORING_ACTIVE
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stats Cards */}
        {[
          { label: 'Total Assets', val: stats.total, icon: Eye, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Critical Threats', val: stats.critical, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' },
          { label: 'High Risk', val: stats.high, icon: ShieldCheck, color: 'text-orange-600', bg: 'bg-orange-50' },
          { label: 'Logged Today', val: stats.newToday, icon: Calendar, color: 'text-emerald-600', bg: 'bg-emerald-50' }
        ].map((stat, i) => (
          <Card key={i} className="bg-white shadow-sm border-none">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
                  <p className={cn("text-2xl font-black", stat.color)}>{stat.val}</p>
                </div>
                <div className={cn("p-2 rounded-lg", stat.bg)}>
                  <stat.icon className={cn("w-5 h-5", stat.color)} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-white shadow-sm border-none overflow-hidden rounded-2xl">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/50">
                <TableHead className="font-bold py-4">Case Identity & Signature</TableHead>
                <TableHead className="font-bold">Neural Verdict</TableHead>
                <TableHead className="font-bold">Risk</TableHead>
                <TableHead className="font-bold">IR Status</TableHead>
                <TableHead className="font-bold text-right pr-6">C2 Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => (
                <TableRow key={log.id} className={cn(
                  "hover:bg-gray-50/80 transition-colors group",
                  log.status === 'locked' ? "bg-red-50/20" : ""
                )}>
                  <TableCell>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-bold text-red-600">{log.caseId}</span>
                        {log.status === 'locked' && <ShieldAlert className="w-3 h-3 text-red-600 animate-bounce" />}
                      </div>
                      <span className="text-[10px] text-gray-400 truncate max-w-[200px]">{log.hashInfo?.sha256}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={cn("font-black text-sm", log.isDeepfake ? "text-red-600" : "text-emerald-600")}>
                      {log.aiConfidence}% {log.isDeepfake ? "FAKE" : "REAL"}
                    </span>
                  </TableCell>
                  <TableCell><RiskBadge level={log.riskLevel} size="sm" /></TableCell>
                  <TableCell><StatusBadge status={log.status} /></TableCell>
                  <TableCell className="text-right pr-6">
                    <Button variant="ghost" size="sm" className="text-red-600 font-bold hover:bg-red-50 gap-2"
                      onClick={() => { setSelectedCase(log); setCurrentView('reports'); }}>
                      <FileSearch className="w-4 h-4" /> Inspect
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </motion.div>
  );
}