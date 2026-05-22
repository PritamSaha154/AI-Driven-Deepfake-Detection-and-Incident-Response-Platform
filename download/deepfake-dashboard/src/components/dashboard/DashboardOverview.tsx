'use client';

import { useMemo } from 'react';
import { Image, AlertTriangle, ShieldAlert, Gauge, Clock, FileSearch } from 'lucide-react';
import { StatCard } from './StatCard';
import { RiskDistributionChart } from './RiskDistributionChart';
import { WeeklyActivityChart } from './WeeklyActivityChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge'; // FIXED: Added missing import
import { useAppStore } from '@/store/useAppStore';
import { RiskBadge } from '@/components/shared/RiskBadge';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { cases as mockCases } from '@/lib/mock-data';

export function DashboardOverview() {
  const { setCurrentView, setSelectedCase, historyCases } = useAppStore();

  // Combine real scans with mock cases
  const allCases = useMemo(() => {
    return [...historyCases, ...mockCases];
  }, [historyCases]);

  const recentCases = allCases.slice(0, 5);

  const liveStats = useMemo(() => {
    const total = allCases.length;
    const deepfakes = allCases.filter(c => c.isDeepfake).length;
    const highRisk = allCases.filter(c => c.riskLevel === 'HIGH' || c.riskLevel === 'CRITICAL').length;
    const avgConfidence = allCases.length > 0 
      ? Math.round(allCases.reduce((acc, curr) => acc + curr.aiConfidence, 0) / allCases.length)
      : 0;

    return { total, deepfakes, highRisk, avgConfidence };
  }, [allCases]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Forensic Overview</h1>
          <p className="text-gray-500 text-sm">AI-Driven Deepfake Detection & Incident Response</p>
        </div>
        {/* FIXED: Badge is now defined via import above */}
        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-100">
          SOC Live: Operational
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Images Analyzed"
          value={liveStats.total.toLocaleString()}
          subtitle="Real-time count"
          icon={Image}
        />
        <StatCard
          title="Deepfakes Detected"
          value={liveStats.deepfakes}
          subtitle="Confirmed anomalies"
          icon={AlertTriangle}
          iconClassName="bg-red-50"
        />
        <StatCard
          title="High Risk Cases"
          value={liveStats.highRisk}
          subtitle="Action required"
          icon={ShieldAlert}
          iconClassName="bg-orange-50"
        />
        <StatCard
          title="Avg AI Confidence"
          value={`${liveStats.avgConfidence}%`}
          subtitle="System accuracy"
          icon={Gauge}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RiskDistributionChart />
        <WeeklyActivityChart />
      </div>

      <Card className="bg-white shadow-sm border-none">
        <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-gray-50">
          <div>
            <CardTitle className="text-lg font-bold text-gray-800">Recent Forensic Logs</CardTitle>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setCurrentView('analysis')}
          >
            View All
          </Button>
        </CardHeader>
        <CardContent className="pt-4">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/50">
                <TableHead className="font-bold">Case ID</TableHead>
                <TableHead className="font-bold">Asset Identity</TableHead>
                <TableHead className="font-bold">AI Verdict</TableHead>
                <TableHead className="font-bold">Risk</TableHead>
                <TableHead className="text-right font-bold pr-6">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentCases.map((caseRecord) => (
                <TableRow key={caseRecord.id} className="hover:bg-gray-50/50 transition-colors">
                  <TableCell className="font-mono text-xs font-bold text-red-600">
                    {caseRecord.caseId}
                  </TableCell>
                  <TableCell className="max-w-[150px] truncate text-sm">
                    {caseRecord.imageName}
                  </TableCell>
                  <TableCell>
                    <span className={cn(
                      'text-sm font-black',
                      caseRecord.isDeepfake ? 'text-red-600' : 'text-emerald-600'
                    )}>
                      {caseRecord.aiConfidence}% {caseRecord.isDeepfake ? 'FAKE' : 'REAL'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <RiskBadge level={caseRecord.riskLevel} size="sm" />
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setSelectedCase(caseRecord)}
                      className="text-red-600 font-bold hover:bg-red-50"
                    >
                      View Report
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