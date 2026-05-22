'use client';

import { 
  FileText, Download, ShieldCheck, ArrowLeft, Fingerprint, FileSearch, 
  Database, Cpu, Clock, MapPin, ShieldAlert, Lock, AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export function ReportsPage() {
  const { historyCases, selectedCase, setSelectedCase } = useAppStore();

  const generatePDF = (record: any) => {
    try {
      const doc = new jsPDF();
      const redColor = [185, 28, 28];
      
      // Header Branding
      doc.setFillColor(redColor[0], redColor[1], redColor[2]);
      doc.rect(0, 0, 210, 45, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");
      doc.text("VERIFAKE FORENSIC AUDIT", 105, 22, { align: 'center' });
      
      doc.setFontSize(10);
      doc.text(`REPORT_ID: ${record.caseId} | STATUS: ${record.status.toUpperCase()}`, 105, 33, { align: 'center' });

      // Forensic Data Table
      autoTable(doc, {
        startY: 55,
        head: [['Forensic Layer', 'Technical Observation']],
        body: [
          ["[LAYER 1] FILE SYSTEM", `Filename: ${record.imageName}\nSHA-256: ${record.hashInfo?.sha256}`],
          ["[LAYER 2] HARDWARE", `Device: ${record.metadata?.find((m: any) => m.field === 'Device Info')?.value || 'Unknown'}`],
          ["[LAYER 3] TIMESTAMPS", `Analysis: ${new Date(record.createdAt).toLocaleString()}\nCapture: ${record.metadata?.find((m: any) => m.field === 'Capture Date')?.value || 'N/A'}`],
          ["[RESULT] AI VERDICT", `${record.isDeepfake ? "MANIPULATED" : "AUTHENTIC"} | Confidence: ${record.aiConfidence}%`]
        ],
        headStyles: { fillColor: redColor },
        theme: 'grid'
      });

      doc.save(`Forensic_Audit_${record.caseId}.pdf`);
    } catch (error) {
      console.error("PDF Export Failure:", error);
    }
  };

  if (selectedCase) {
    const getMeta = (field: string) => selectedCase.metadata?.find(m => m.field === field)?.value || 'N/A';
    const isLocked = selectedCase.status === 'locked';

    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 pb-20">
        <Button variant="ghost" onClick={() => setSelectedCase(null)} className="text-gray-500 font-bold hover:text-red-600 gap-2">
          <ArrowLeft className="w-4 h-4" /> Return to Archives
        </Button>

        <Card className="border-none shadow-2xl rounded-3xl overflow-hidden bg-white">
          <CardHeader className="bg-slate-900 text-white p-10 relative">
            <div className="flex justify-between items-center relative z-10">
              <div>
                <div className="flex gap-2 mb-3">
                  <Badge className="bg-emerald-500 border-none px-3 py-1 text-[10px] tracking-widest">AUDIT_COMPLETE</Badge>
                  {isLocked && (
                    <Badge className="bg-red-600 border-none animate-pulse flex gap-1 items-center px-3 py-1 text-[10px] tracking-widest">
                      <Lock className="w-3 h-3" /> EVIDENCE_LOCKED
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-4xl font-black font-mono tracking-tighter uppercase">Forensic_Dossier_{selectedCase.caseId}</CardTitle>
                <p className="font-mono text-xs text-emerald-400 mt-2 truncate max-w-md">SHA-256: {selectedCase.hashInfo?.sha256}</p>
              </div>
              <ShieldCheck className={cn("w-20 h-20 transition-colors", isLocked ? "text-red-500 opacity-40" : "text-emerald-500 opacity-40")} />
            </div>
          </CardHeader>

          <CardContent className="p-8 space-y-8">
            {/* Technical Metadata Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Database className="w-3 h-3" /> Hardware Origin
                  </h4>
                  <p className="text-lg font-bold text-slate-900">{getMeta('Device Info')}</p>
                  <p className="text-xs text-slate-500 font-mono">Software Trace: {getMeta('Software')}</p>
               </div>
               <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <MapPin className="w-3 h-3" /> Geolocation
                  </h4>
                  <p className="text-lg font-bold text-slate-900">{getMeta('GPS Location') !== 'N/A' ? getMeta('GPS Location') : 'No GPS Data Extracted'}</p>
                  <p className="text-xs text-slate-500 font-mono">Capture Time: {getMeta('Capture Date')}</p>
               </div>
            </div>

            {/* Verdict Display */}
            <div className={cn(
              "p-10 rounded-3xl border-4 text-center transition-all",
              selectedCase.isDeepfake ? "bg-red-50 border-red-200" : "bg-emerald-50 border-emerald-200"
            )}>
              <h2 className={cn("text-6xl font-black mb-2", selectedCase.isDeepfake ? "text-red-600" : "text-emerald-600")}>
                {selectedCase.aiConfidence}% {selectedCase.isDeepfake ? "FAKE" : "REAL"}
              </h2>
              <p className="text-slate-500 font-mono text-xs uppercase tracking-widest">
                Analyzed by Lead Investigator Pritam Saha
              </p>
            </div>

            {/* SECURED DOWNLOAD BUTTON */}
            <div className="space-y-4">
              <Button 
                className={cn(
                  "w-full h-20 text-white text-xl font-black rounded-2xl gap-4 shadow-2xl transition-all",
                  isLocked 
                    ? "bg-slate-400 cursor-not-allowed grayscale" 
                    : "bg-slate-900 hover:bg-black active:scale-95"
                )}
                onClick={() => !isLocked && generatePDF(selectedCase)}
                disabled={isLocked}
              >
                {isLocked ? <Lock className="w-6 h-6" /> : <Download className="w-6 h-6" />}
                {isLocked ? "EXPORT RESTRICTED: ASSET LOCKED" : "DOWNLOAD OFFICIAL FORENSIC DOSSIER"}
              </Button>

              {isLocked && (
                <div className="flex items-center justify-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 animate-pulse">
                  <ShieldAlert className="w-4 h-4" />
                  <p className="text-[10px] font-mono font-bold uppercase tracking-tight">
                    Security Policy: Evidence containment active. PDF generation restricted for Critical Risk level.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Forensic Reports Engine</h1>
          <p className="text-sm text-gray-500 font-medium">Verified audit trails and PDF certificates</p>
        </div>
      </div>

      <Card className="bg-white shadow-sm border-none overflow-hidden rounded-2xl">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="font-bold pl-6 text-gray-400 text-[10px] uppercase py-4">Identifier</TableHead>
              <TableHead className="font-bold text-gray-400 text-[10px] uppercase">Confidence</TableHead>
              <TableHead className="font-bold text-gray-400 text-[10px] uppercase">C2 Status</TableHead>
              <TableHead className="text-right pr-6 font-bold text-gray-400 text-[10px] uppercase">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {historyCases.map((report) => (
              <TableRow key={report.id} className="hover:bg-gray-50/50 transition-colors">
                <TableCell className="pl-6 py-4">
                  <div className="flex flex-col">
                    <span className="font-mono font-black text-red-600 text-sm">{report.caseId}</span>
                    {report.status === 'locked' && (
                      <span className="text-[9px] text-red-500 font-black uppercase tracking-widest flex items-center gap-1">
                        <Lock className="w-2 h-2" /> Evidence_Locked
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="font-black text-lg">{report.aiConfidence}%</TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                     <Badge className={cn(
                       "font-bold border-none px-3 py-1",
                       report.isDeepfake ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"
                     )}>
                       {report.isDeepfake ? "FAKE" : "REAL"}
                     </Badge>
                     {report.status === 'locked' && (
                       <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse shadow-[0_0_8px_red]" />
                     )}
                  </div>
                </TableCell>
                <TableCell className="text-right pr-6">
                  <Button size="sm" variant="ghost" onClick={() => setSelectedCase(report)} className="text-red-600 font-bold hover:bg-red-50 transition-all">
                    <FileSearch className="w-4 h-4 mr-2" /> View Dossier
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {historyCases.length === 0 && (
          <div className="py-20 text-center text-gray-400 font-mono text-xs">NO_REPORTS_ARCHIVED</div>
        )}
      </Card>
    </div>
  );
}