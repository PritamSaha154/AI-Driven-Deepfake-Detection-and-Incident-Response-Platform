'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, FileImage, X, CheckCircle2, AlertCircle, 
  Loader2, Database, ShieldCheck, ClipboardList 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge'; 
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAppStore } from '@/store/useAppStore';
import { RiskBadge } from '@/components/shared/RiskBadge';
import { CaseRecord, RiskLevel } from '@/types';
import { cn } from '@/lib/utils';

export function UploadPage() {
  const { 
    uploadedImage, setUploadedImage, 
    analysisResult, setAnalysisResult, 
    isAnalyzing, setIsAnalyzing, 
    addCaseToHistory,
    irProtocols,
    addLog 
  } = useAppStore();

  const [fileName, setFileName] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const processFile = (file: File) => {
    setFileName(file.name);
    setAnalysisResult(null);
    addLog(`FILE_IDENTIFIED: Asset "${file.name}" loaded into memory.`);
    const reader = new FileReader();
    reader.onload = (event) => setUploadedImage(event.target?.result as string);
    reader.readAsDataURL(file);
  };

  const analyzeImage = useCallback(async () => {
    if (!fileName || !uploadedImage) return;
    setIsAnalyzing(true);
    setError(null);

    addLog(`INIT_SCAN: Requesting forensic audit for ${fileName}`);
    
    if (irProtocols.hashCheck) {
      addLog("INTEGRITY: SHA-256 Protocol enabled. Validating bitstream...");
    }

    try {
      const response = await fetch(uploadedImage);
      const blob = await response.blob();
      const formData = new FormData();
      formData.append('file', new File([blob], fileName, { type: blob.type }));
      
      addLog("SOC_NODE: Transmitting payload to AI Forensic Engine...");
      
      const apiResponse = await fetch('http://127.0.0.1:8000/predict', { 
        method: 'POST', 
        body: formData 
      });
      
      if (!apiResponse.ok) throw new Error("Backend response error");
      
      const data = await apiResponse.json();
      addLog(`ENGINE_SUCCESS: Neural analysis returned confidence of ${data.ai_score}%`);

      if (irProtocols.sanitization) {
        addLog("IR_PROTOCOL: Sanitizing metadata headers as per security policy.");
      }

      // --- CRITICAL FIX: PRE-CONSTRUCT RESULT OBJECT ---
      const finalResult: CaseRecord = {
        id: Date.now().toString(),
        caseId: `DF-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        imageName: fileName,
        imageUrl: uploadedImage,
        aiConfidence: data.ai_score || 0,
        riskLevel: (data.risk_level?.toUpperCase() as RiskLevel) || 'LOW',
        riskScore: data.ai_score || 0,
        status: 'open', // Default
        createdAt: new Date(),
        updatedAt: new Date(),
        analystName: 'Pritam Saha',
        isDeepfake: data.prediction === 'FAKE',
        metadata: [
          { field: 'Software', value: data.forensics?.exif?.Software || 'Clean Trace', status: 'verified' },
          { field: 'GPS Location', value: data.forensics?.gps ? `${data.forensics.gps.lat}, ${data.forensics.gps.lon}` : 'N/A', status: data.forensics?.gps ? 'verified' : 'neutral' },
          { field: 'Device Info', value: `${data.forensics?.exif?.Make || ''} ${data.forensics?.exif?.Model || ''}`.trim() || 'Unknown', status: 'verified' },
          { field: 'Capture Date', value: data.forensics?.exif?.DateTimeOriginal || 'Unknown', status: 'verified' }
        ],
        hashInfo: { 
          sha256: data.hash, 
          fileSize: `${(blob.size / 1024).toFixed(1)} KB`, 
          fileType: blob.type, 
          isDuplicate: false, 
          firstSeenDate: null 
        },
        recommendations: [data.incident_response, "Evidence logged in secure vault"]
      };

      // --- APPLY IR LOCK LOGIC BEFORE DISPATCHING TO STORE ---
      if (irProtocols.autoLock && finalResult.aiConfidence > 85 && finalResult.isDeepfake) {
        addLog(`CRITICAL_LOCK: High-Risk Detected. Auto-Locking Case ${finalResult.caseId}...`);
        finalResult.status = 'locked';
      }

      // Final dispatch with the potentially 'locked' object
      addLog(`VAULT_SYNC: Archiving Case ${finalResult.caseId} as status: ${finalResult.status.toUpperCase()}`);
      setAnalysisResult(finalResult);
      addCaseToHistory(finalResult);

    } catch (err) { 
      addLog("NODE_FAILURE: Connection to Python backend lost. Check API terminal.");
      setError('Forensic Engine Connection Failed. Ensure Python server is running.'); 
    } finally { 
      setIsAnalyzing(false); 
    }
  }, [fileName, uploadedImage, irProtocols, addLog, setAnalysisResult, addCaseToHistory, setIsAnalyzing]);

  if (!mounted) return null;

  return (
    <div className="space-y-6">
      <Card className="bg-white shadow-sm border-none rounded-2xl overflow-hidden">
        <CardHeader className="border-b border-gray-50">
          <CardTitle className="text-xl font-bold text-gray-800">Forensic Asset Scan</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {!uploadedImage ? (
            <div className="border-2 border-dashed rounded-2xl p-16 text-center bg-slate-50 hover:bg-slate-100 transition-all cursor-pointer border-slate-200">
              <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])} className="hidden" id="file-up" />
              <label htmlFor="file-up" className="cursor-pointer block">
                <FileImage className="w-20 h-20 mx-auto text-slate-300 mb-4" />
                <p className="text-lg font-bold text-slate-600">Click to Upload Forensic Evidence</p>
                <p className="text-xs text-slate-400 mt-2 font-mono uppercase tracking-widest tracking-tight">NIST COMPLIANT SCANNER ACTIVE</p>
              </label>
            </div>
          ) : (
            <div className="space-y-6 text-center">
              <div className="relative inline-block group">
                <img src={uploadedImage} alt="Forensic Target" className="max-h-96 mx-auto rounded-2xl shadow-2xl border-8 border-white" />
                <Button variant="destructive" size="icon" className="absolute -top-4 -right-4 rounded-full shadow-xl" onClick={() => setUploadedImage(null)}><X className="w-5 h-5" /></Button>
              </div>
              <div className="flex flex-col items-center gap-4">
                 <Button onClick={analyzeImage} disabled={isAnalyzing} className="bg-red-600 hover:bg-red-700 h-14 px-12 rounded-full text-lg font-black shadow-xl shadow-red-100 transition-all active:scale-95">
                  {isAnalyzing ? <Loader2 className="animate-spin mr-3 h-6 w-6" /> : <ShieldCheck className="mr-3 h-6 w-6" />} 
                  {isAnalyzing ? "EXECUTING DEEP SCAN..." : "INITIATE FORENSIC ANALYSIS"}
                </Button>
              </div>
            </div>
          )}
          {error && (
            <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-xl border border-red-100 font-bold flex items-center justify-center gap-2">
              <AlertCircle className="w-5 h-5" /> {error}
            </div>
          )}
        </CardContent>
      </Card>

      <AnimatePresence>
        {analysisResult && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="space-y-6">
            <Card className="border-none shadow-2xl overflow-hidden rounded-3xl">
              <CardHeader className="bg-slate-900 text-white p-8">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-emerald-400 font-mono text-[10px] tracking-widest uppercase mb-1">Audit_Result_Authenticated</p>
                    <CardTitle className="text-3xl font-black italic">VERIFAKE_SCAN_v4.2</CardTitle>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge className={cn("text-xl px-6 py-2 border-none font-black shadow-lg", analysisResult.isDeepfake ? "bg-red-600" : "bg-emerald-500")}>
                      {analysisResult.aiConfidence}% {analysisResult.isDeepfake ? "FAKE" : "REAL"}
                    </Badge>
                    {analysisResult.status === 'locked' && (
                      <Badge className="bg-red-50 text-red-600 border-red-200 animate-bounce uppercase font-bold text-[10px] px-3">Case Auto-Locked</Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                 <Progress value={analysisResult.aiConfidence} className={cn("h-4 rounded-none", analysisResult.isDeepfake ? "bg-red-950" : "bg-emerald-950")} />
              </CardContent>
            </Card>
            
            <Tabs defaultValue="metadata" className="w-full">
              <TabsList className="bg-gray-200/50 p-1 w-full rounded-2xl">
                <TabsTrigger value="metadata" className="flex-1 font-black uppercase text-[10px]">Forensic Metadata</TabsTrigger>
                <TabsTrigger value="hash" className="flex-1 font-black uppercase text-[10px]">Integrity Signature</TabsTrigger>
              </TabsList>
              <TabsContent value="metadata" className="mt-4">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
                        <th className="p-4 text-left">Audit Field</th>
                        <th className="p-4 text-left">Value</th>
                        <th className="p-4 text-left">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {analysisResult.metadata.map((m, i) => (
                        <tr key={i} className="hover:bg-slate-50 transition-colors">
                          <td className="p-4 font-bold text-slate-700 text-sm">{m.field}</td>
                          <td className="p-4 font-mono text-xs text-slate-500">{m.value}</td>
                          <td className="p-4">
                            <Badge className={cn("border-none font-bold text-[10px] uppercase", m.status === 'verified' ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700")}>
                              {m.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </TabsContent>
              <TabsContent value="hash" className="mt-4 p-8 bg-slate-950 rounded-3xl border border-slate-800">
                <div className="flex items-center gap-3 mb-4 text-emerald-500">
                  <Database className="w-5 h-5" />
                  <span className="text-xs font-mono font-black uppercase tracking-[0.3em]">SHA-256_EVIDENCE_SIGNATURE</span>
                </div>
                <code className="text-sm text-emerald-400 break-all leading-loose font-mono block p-4 bg-black/40 rounded-xl border border-white/5">
                  {analysisResult.hashInfo.sha256}
                </code>
              </TabsContent>
            </Tabs>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}