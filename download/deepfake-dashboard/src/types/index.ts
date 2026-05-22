// --- RISK & STATUS DEFINITIONS ---
// Added uppercase variants to match Python API responses
export type RiskLevel = 
  | 'low' | 'medium' | 'high' | 'critical' 
  | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

// FIXED: Added 'locked' for the Incident Response containment protocol
export type CaseStatus = 'open' | 'under_review' | 'closed' | 'locked';

export type UserRole = 'admin' | 'analyst';

// --- CORE INTERFACES ---
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface CaseRecord {
  id: string;
  caseId: string;
  imageName: string;
  imageUrl: string;
  aiConfidence: number;
  riskLevel: RiskLevel;
  riskScore: number;
  status: CaseStatus;
  createdAt: Date;
  updatedAt: Date;
  analystId?: string;
  analystName: string;
  isDeepfake: boolean;
  realPercentage?: number;
  fakePercentage?: number;
  metadata: MetadataEntry[];
  hashInfo: HashInfo;
  recommendations: string[];
}

export interface MetadataEntry {
  field: string;
  value: string;
  // Standardized to match the UploadPage forensic verification logic
  status: 'valid' | 'suspicious' | 'invalid' | 'verified' | 'neutral';
}

export interface HashInfo {
  sha256: string;
  isDuplicate: boolean;
  firstSeenDate: Date | null;
  fileSize: string;
  fileType: string;
}

// --- LOGGING & AUDIT INTERFACES ---
export interface EvidenceLog {
  id: string;
  caseId: string;
  date: Date;
  aiScore: number;
  riskLevel: RiskLevel;
  analystName: string;
  action: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  caseId?: string;
  timestamp: Date;
  details: string;
}

// --- REPORTING & DASHBOARD INTERFACES ---
export interface Report {
  id: string;
  reportId: string;
  caseId: string;
  generatedAt: Date;
  generatedBy: string;
  fileSize: string;
}

export interface WeeklyActivity {
  day: string;
  date: string;
  imagesAnalyzed: number;
  deepfakesDetected: number;
}

export interface DashboardStats {
  totalImagesAnalyzed: number;
  deepfakesDetected: number;
  highRiskCases: number;
  averageAiConfidence: number;
}

export interface RiskDistribution {
  low: number;
  medium: number;
  high: number;
  critical: number;
}

// --- NAVIGATION ---
export type ViewType = 
  | 'dashboard' 
  | 'upload' 
  | 'analysis' 
  | 'evidence' 
  | 'reports' 
  | 'settings' 
  | 'case-detail';