'use client';
import { Search, Filter, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAppStore } from '@/store/useAppStore';
import { RiskBadge } from '@/components/shared/RiskBadge';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { cn } from '@/lib/utils';

export function AnalysisHistory() {
  const { setSelectedCase, searchQuery, setSearchQuery, riskFilter, setRiskFilter, getFilteredCases } = useAppStore();
  const filteredCases = getFilteredCases();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Analysis History</h1>
      <Card className="bg-white shadow-sm"><CardContent className="pt-6 flex gap-4">
        <div className="flex-1 relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><Input placeholder="Search Asset..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" /></div>
        <Select value={riskFilter} onValueChange={setRiskFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Risk" /></SelectTrigger>
          <SelectContent><SelectItem value="all">All Risk</SelectItem><SelectItem value="CRITICAL">Critical</SelectItem><SelectItem value="HIGH">High</SelectItem><SelectItem value="LOW">Low</SelectItem></SelectContent>
        </Select>
      </CardContent></Card>

      <Card className="bg-white shadow-sm"><CardContent className="p-0">
        <Table>
          <TableHeader><TableRow className="bg-gray-50"><TableHead>Case ID</TableHead><TableHead>Asset Name</TableHead><TableHead>AI Score</TableHead><TableHead>Risk</TableHead><TableHead>Date</TableHead><TableHead className="text-right">Action</TableHead></TableRow></TableHeader>
          <TableBody>
            {filteredCases.map((record) => (
              <TableRow key={record.id} className="hover:bg-gray-50" onClick={() => setSelectedCase(record)}>
                <TableCell className="font-mono text-red-600 font-bold">{record.caseId}</TableCell>
                <TableCell className="font-medium">{record.imageName}</TableCell>
                <TableCell className={cn('font-bold', record.aiConfidence >= 70 ? 'text-red-600' : 'text-green-600')}>{record.aiConfidence}%</TableCell>
                <TableCell><RiskBadge level={record.riskLevel} size="sm" /></TableCell>
                <TableCell className="text-sm text-gray-500">{new Date(record.createdAt).toLocaleDateString()}</TableCell>
                <TableCell className="text-right"><Button variant="ghost" size="sm" className="text-red-600 font-bold">View</Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent></Card>
    </div>
  );
}