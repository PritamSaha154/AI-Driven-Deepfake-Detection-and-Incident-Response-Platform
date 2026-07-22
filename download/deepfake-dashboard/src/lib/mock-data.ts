import { User, CaseRecord, EvidenceLog, AuditLog, Report, WeeklyActivity, DashboardStats, RiskDistribution, MetadataEntry, HashInfo } from '@/types';

export const currentUser: User = {
  id: 'user-1',
  name: 'Pritam Saha',
  email: 'pritam.devoloper@deepfakedetection.com',
  role: 'analyst',
  avatar: undefined,
};

export const users: User[] = [
  currentUser,
  {
    id: 'user-2',
    name: 'Goursundar devoloper',
    email: 'goursundar.devoloper@deepfakedetection.com',
    role: 'admin',
  },
  {
    id: 'user-3',
    name: 'Argha Investigator',
    email: 'argha.investigator@deepfakedetection.com',
    role: 'analyst',
  },
];

const generateMetadata = (riskLevel: string): MetadataEntry[] => {
  return [];
};

const generateHashInfo = (isDuplicate: boolean): HashInfo => ({
  sha256: '',
  isDuplicate: false,
  firstSeenDate: null,
  fileSize: '0 MB',
  fileType: 'Unknown',
});

const generateRecommendations = (riskLevel: string): string[] => {
  return [];
};

const riskLevels: Array<'low' | 'medium' | 'high' | 'critical'> = ['low', 'medium', 'high', 'critical'];
const statuses: Array<'open' | 'under_review' | 'closed'> = ['open', 'under_review', 'closed'];
const analysts = ['John Analyst', 'Sarah Admin', 'Mike Investigator', 'Emily Chen', 'David Kim'];

// Wiped clean for the live demonstration
const caseData: Omit<CaseRecord, 'metadata' | 'hashInfo' | 'recommendations'>[] = [];

export const cases: CaseRecord[] = [];

export const evidenceLogs: EvidenceLog[] = [];

export const auditLogs: AuditLog[] = [];

export const reports: Report[] = [];

// Zeroed out weekly chart
export const weeklyActivity: WeeklyActivity[] = [
  { day: 'Mon', date: 'Mar 11', imagesAnalyzed: 0, deepfakesDetected: 0 },
  { day: 'Tue', date: 'Mar 12', imagesAnalyzed: 0, deepfakesDetected: 0 },
  { day: 'Wed', date: 'Mar 13', imagesAnalyzed: 0, deepfakesDetected: 0 },
  { day: 'Thu', date: 'Mar 14', imagesAnalyzed: 0, deepfakesDetected: 0 },
  { day: 'Fri', date: 'Mar 15', imagesAnalyzed: 0, deepfakesDetected: 0 },
  { day: 'Sat', date: 'Mar 16', imagesAnalyzed: 0, deepfakesDetected: 0 },
  { day: 'Sun', date: 'Mar 17', imagesAnalyzed: 0, deepfakesDetected: 0 },
];

// Zeroed out top dashboard cards
export const dashboardStats: DashboardStats = {
  totalImagesAnalyzed: 0,
  deepfakesDetected: 0,
  highRiskCases: 0,
  averageAiConfidence: 0,
};

// Zeroed out pie chart
export const riskDistribution: RiskDistribution = {
  low: 0,
  medium: 0,
  high: 0,
  critical: 0,
};

export function getCaseById(caseId: string): CaseRecord | undefined {
  return cases.find(c => c.caseId === caseId || c.id === caseId);
}

export function getCasesByRiskLevel(riskLevel: string): CaseRecord[] {
  return cases.filter(c => c.riskLevel === riskLevel);
}

export function getEvidenceByCaseId(caseId: string): EvidenceLog[] {
  return evidenceLogs.filter(e => e.caseId === caseId);
}