import { User, CaseRecord, EvidenceLog, AuditLog, Report, WeeklyActivity, DashboardStats, RiskDistribution, MetadataEntry, HashInfo } from '@/types';

export const currentUser: User = {
  id: 'user-1',
  name: 'Goursundar Analyst',
  email: 'goursundar.analyst@deepfakedetection.com',
  role: 'analyst',
  avatar: undefined,
};

export const users: User[] = [
  currentUser,
  {
    id: 'user-2',
    name: 'Pritam Admin',
    email: 'pritam.admin@deepfakedetection.com',
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
  const baseMetadata: MetadataEntry[] = [
    { field: 'Creation Date', value: '2024-03-15', status: 'valid' },
    { field: 'Camera Model', value: 'Canon EOS R5', status: 'valid' },
    { field: 'Resolution', value: '8192 x 5464', status: 'valid' },
    { field: 'Color Space', value: 'sRGB', status: 'valid' },
  ];

  if (riskLevel === 'high' || riskLevel === 'critical') {
    baseMetadata.push(
      { field: 'Editing Software', value: 'Adobe Photoshop 2024', status: 'suspicious' },
      { field: 'Last Modified', value: '2024-03-18', status: 'suspicious' }
    );
  }

  return baseMetadata;
};

const generateHashInfo = (isDuplicate: boolean): HashInfo => ({
  sha256: Array.from({ length: 64 }, () => '0123456789abcdef'[Math.floor(Math.random() * 16)]).join(''),
  isDuplicate,
  firstSeenDate: isDuplicate ? new Date('2024-02-20') : null,
  fileSize: `${(Math.random() * 5 + 1).toFixed(2)} MB`,
  fileType: 'JPEG',
});

const generateRecommendations = (riskLevel: string): string[] => {
  const baseRecommendations = [
    'Preserve original image hash for evidence chain',
    'Document all findings in case management system',
  ];

  if (riskLevel === 'high' || riskLevel === 'critical') {
    return [
      ...baseRecommendations,
      'Verify authenticity from original source',
      'Avoid public distribution until verified',
      'Escalate to senior analyst for review',
      'Consider forensic image analysis',
    ];
  }

  if (riskLevel === 'medium') {
    return [
      ...baseRecommendations,
      'Cross-reference with known authentic sources',
      'Schedule follow-up review',
    ];
  }

  return [
    ...baseRecommendations,
    'Image appears authentic - standard processing recommended',
  ];
};

const riskLevels: Array<'low' | 'medium' | 'high' | 'critical'> = ['low', 'medium', 'high', 'critical'];
const statuses: Array<'open' | 'under_review' | 'closed'> = ['open', 'under_review', 'closed'];
const analysts = ['John Analyst', 'Sarah Admin', 'Mike Investigator', 'Emily Chen', 'David Kim'];

const caseData: Omit<CaseRecord, 'metadata' | 'hashInfo' | 'recommendations'>[] = [
  { id: '1', caseId: 'DF-2024-0001', imageName: 'political_figure_speech.jpg', imageUrl: '/api/placeholder/400/300', aiConfidence: 94, riskLevel: 'critical', riskScore: 9.2, status: 'open', createdAt: new Date('2024-03-18'), updatedAt: new Date('2024-03-18'), analystId: 'user-1', analystName: 'John Analyst', isDeepfake: true, realPercentage: 6, fakePercentage: 94 },
  { id: '2', caseId: 'DF-2024-0002', imageName: 'news_anchor_video_frame.png', imageUrl: '/api/placeholder/400/300', aiConfidence: 87, riskLevel: 'high', riskScore: 8.1, status: 'under_review', createdAt: new Date('2024-03-17'), updatedAt: new Date('2024-03-18'), analystId: 'user-2', analystName: 'Sarah Admin', isDeepfake: true, realPercentage: 13, fakePercentage: 87 },
  { id: '3', caseId: 'DF-2024-0003', imageName: 'celebrity_interview.jpg', imageUrl: '/api/placeholder/400/300', aiConfidence: 72, riskLevel: 'high', riskScore: 7.5, status: 'open', createdAt: new Date('2024-03-17'), updatedAt: new Date('2024-03-17'), analystId: 'user-1', analystName: 'John Analyst', isDeepfake: true, realPercentage: 28, fakePercentage: 72 },
  { id: '4', caseId: 'DF-2024-0004', imageName: 'corporate_announcement.png', imageUrl: '/api/placeholder/400/300', aiConfidence: 45, riskLevel: 'medium', riskScore: 5.2, status: 'under_review', createdAt: new Date('2024-03-16'), updatedAt: new Date('2024-03-17'), analystId: 'user-3', analystName: 'Mike Investigator', isDeepfake: false, realPercentage: 55, fakePercentage: 45 },
  { id: '5', caseId: 'DF-2024-0005', imageName: 'press_conference.jpg', imageUrl: '/api/placeholder/400/300', aiConfidence: 23, riskLevel: 'low', riskScore: 2.8, status: 'closed', createdAt: new Date('2024-03-16'), updatedAt: new Date('2024-03-18'), analystId: 'user-2', analystName: 'Sarah Admin', isDeepfake: false, realPercentage: 77, fakePercentage: 23 },
  { id: '6', caseId: 'DF-2024-0006', imageName: 'social_media_post.jpg', imageUrl: '/api/placeholder/400/300', aiConfidence: 89, riskLevel: 'critical', riskScore: 9.5, status: 'open', createdAt: new Date('2024-03-15'), updatedAt: new Date('2024-03-15'), analystId: 'user-1', analystName: 'John Analyst', isDeepfake: true, realPercentage: 11, fakePercentage: 89 },
  { id: '7', caseId: 'DF-2024-0007', imageName: 'witness_statement_img.png', imageUrl: '/api/placeholder/400/300', aiConfidence: 31, riskLevel: 'low', riskScore: 3.1, status: 'closed', createdAt: new Date('2024-03-15'), updatedAt: new Date('2024-03-17'), analystId: 'user-3', analystName: 'Mike Investigator', isDeepfake: false, realPercentage: 69, fakePercentage: 31 },
  { id: '8', caseId: 'DF-2024-0008', imageName: 'document_scan.jpg', imageUrl: '/api/placeholder/400/300', aiConfidence: 18, riskLevel: 'low', riskScore: 2.1, status: 'closed', createdAt: new Date('2024-03-14'), updatedAt: new Date('2024-03-16'), analystId: 'user-2', analystName: 'Sarah Admin', isDeepfake: false, realPercentage: 82, fakePercentage: 18 },
  { id: '9', caseId: 'DF-2024-0009', imageName: 'breaking_news_frame.png', imageUrl: '/api/placeholder/400/300', aiConfidence: 91, riskLevel: 'critical', riskScore: 8.9, status: 'under_review', createdAt: new Date('2024-03-14'), updatedAt: new Date('2024-03-18'), analystId: 'user-1', analystName: 'John Analyst', isDeepfake: true, realPercentage: 9, fakePercentage: 91 },
  { id: '10', caseId: 'DF-2024-0010', imageName: 'interview_screenshot.jpg', imageUrl: '/api/placeholder/400/300', aiConfidence: 67, riskLevel: 'medium', riskScore: 6.3, status: 'open', createdAt: new Date('2024-03-13'), updatedAt: new Date('2024-03-13'), analystId: 'user-3', analystName: 'Mike Investigator', isDeepfake: true, realPercentage: 33, fakePercentage: 67 },
  { id: '11', caseId: 'DF-2024-0011', imageName: 'official_portrait.png', imageUrl: '/api/placeholder/400/300', aiConfidence: 12, riskLevel: 'low', riskScore: 1.5, status: 'closed', createdAt: new Date('2024-03-13'), updatedAt: new Date('2024-03-14'), analystId: 'user-2', analystName: 'Sarah Admin', isDeepfake: false, realPercentage: 88, fakePercentage: 12 },
  { id: '12', caseId: 'DF-2024-0012', imageName: 'viral_video_frame.jpg', imageUrl: '/api/placeholder/400/300', aiConfidence: 96, riskLevel: 'critical', riskScore: 9.8, status: 'open', createdAt: new Date('2024-03-12'), updatedAt: new Date('2024-03-12'), analystId: 'user-1', analystName: 'John Analyst', isDeepfake: true, realPercentage: 4, fakePercentage: 96 },
  { id: '13', caseId: 'DF-2024-0013', imageName: 'testimonial_photo.jpg', imageUrl: '/api/placeholder/400/300', aiConfidence: 58, riskLevel: 'medium', riskScore: 5.8, status: 'under_review', createdAt: new Date('2024-03-12'), updatedAt: new Date('2024-03-15'), analystId: 'user-3', analystName: 'Mike Investigator', isDeepfake: false, realPercentage: 42, fakePercentage: 58 },
  { id: '14', caseId: 'DF-2024-0014', imageName: 'event_coverage.png', imageUrl: '/api/placeholder/400/300', aiConfidence: 79, riskLevel: 'high', riskScore: 7.9, status: 'open', createdAt: new Date('2024-03-11'), updatedAt: new Date('2024-03-11'), analystId: 'user-1', analystName: 'John Analyst', isDeepfake: true, realPercentage: 21, fakePercentage: 79 },
  { id: '15', caseId: 'DF-2024-0015', imageName: 'news_report_screenshot.jpg', imageUrl: '/api/placeholder/400/300', aiConfidence: 34, riskLevel: 'low', riskScore: 3.4, status: 'closed', createdAt: new Date('2024-03-11'), updatedAt: new Date('2024-03-13'), analystId: 'user-2', analystName: 'Sarah Admin', isDeepfake: false, realPercentage: 66, fakePercentage: 34 },
  { id: '16', caseId: 'DF-2024-0016', imageName: 'press_release_image.jpg', imageUrl: '/api/placeholder/400/300', aiConfidence: 83, riskLevel: 'high', riskScore: 8.4, status: 'under_review', createdAt: new Date('2024-03-10'), updatedAt: new Date('2024-03-12'), analystId: 'user-1', analystName: 'John Analyst', isDeepfake: true, realPercentage: 17, fakePercentage: 83 },
  { id: '17', caseId: 'DF-2024-0017', imageName: 'candid_photo.png', imageUrl: '/api/placeholder/400/300', aiConfidence: 28, riskLevel: 'low', riskScore: 2.9, status: 'closed', createdAt: new Date('2024-03-10'), updatedAt: new Date('2024-03-11'), analystId: 'user-3', analystName: 'Mike Investigator', isDeepfake: false, realPercentage: 72, fakePercentage: 28 },
  { id: '18', caseId: 'DF-2024-0018', imageName: 'broadcast_frame.jpg', imageUrl: '/api/placeholder/400/300', aiConfidence: 92, riskLevel: 'critical', riskScore: 9.1, status: 'open', createdAt: new Date('2024-03-09'), updatedAt: new Date('2024-03-09'), analystId: 'user-2', analystName: 'Sarah Admin', isDeepfake: true, realPercentage: 8, fakePercentage: 92 },
  { id: '19', caseId: 'DF-2024-0019', imageName: 'official_statement.jpg', imageUrl: '/api/placeholder/400/300', aiConfidence: 41, riskLevel: 'medium', riskScore: 4.8, status: 'under_review', createdAt: new Date('2024-03-09'), updatedAt: new Date('2024-03-10'), analystId: 'user-1', analystName: 'John Analyst', isDeepfake: false, realPercentage: 59, fakePercentage: 41 },
  { id: '20', caseId: 'DF-2024-0020', imageName: 'media_appearance.png', imageUrl: '/api/placeholder/400/300', aiConfidence: 76, riskLevel: 'high', riskScore: 7.2, status: 'open', createdAt: new Date('2024-03-08'), updatedAt: new Date('2024-03-08'), analystId: 'user-3', analystName: 'Mike Investigator', isDeepfake: true, realPercentage: 24, fakePercentage: 76 },
];

export const cases: CaseRecord[] = caseData.map(c => ({
  ...c,
  metadata: generateMetadata(c.riskLevel),
  hashInfo: generateHashInfo(Math.random() > 0.7),
  recommendations: generateRecommendations(c.riskLevel),
}));

export const evidenceLogs: EvidenceLog[] = [
  { id: '1', caseId: 'DF-2024-0001', date: new Date('2024-03-18T09:30:00'), aiScore: 94, riskLevel: 'critical', analystName: 'John Analyst', action: 'Initial analysis completed' },
  { id: '2', caseId: 'DF-2024-0002', date: new Date('2024-03-17T14:22:00'), aiScore: 87, riskLevel: 'high', analystName: 'Sarah Admin', action: 'Escalated for review' },
  { id: '3', caseId: 'DF-2024-0003', date: new Date('2024-03-17T11:45:00'), aiScore: 72, riskLevel: 'high', analystName: 'John Analyst', action: 'Metadata analysis performed' },
  { id: '4', caseId: 'DF-2024-0004', date: new Date('2024-03-16T16:30:00'), aiScore: 45, riskLevel: 'medium', analystName: 'Mike Investigator', action: 'Source verification pending' },
  { id: '5', caseId: 'DF-2024-0005', date: new Date('2024-03-16T10:15:00'), aiScore: 23, riskLevel: 'low', analystName: 'Sarah Admin', action: 'Case closed - verified authentic' },
  { id: '6', caseId: 'DF-2024-0006', date: new Date('2024-03-15T13:50:00'), aiScore: 89, riskLevel: 'critical', analystName: 'John Analyst', action: 'Urgent escalation initiated' },
  { id: '7', caseId: 'DF-2024-0007', date: new Date('2024-03-15T09:20:00'), aiScore: 31, riskLevel: 'low', analystName: 'Mike Investigator', action: 'Standard processing' },
  { id: '8', caseId: 'DF-2024-0008', date: new Date('2024-03-14T15:40:00'), aiScore: 18, riskLevel: 'low', analystName: 'Sarah Admin', action: 'Document verified' },
  { id: '9', caseId: 'DF-2024-0009', date: new Date('2024-03-14T11:10:00'), aiScore: 91, riskLevel: 'critical', analystName: 'John Analyst', action: 'Forensic analysis requested' },
  { id: '10', caseId: 'DF-2024-0010', date: new Date('2024-03-13T14:55:00'), aiScore: 67, riskLevel: 'medium', analystName: 'Mike Investigator', action: 'Awaiting source confirmation' },
  { id: '11', caseId: 'DF-2024-0011', date: new Date('2024-03-13T10:30:00'), aiScore: 12, riskLevel: 'low', analystName: 'Sarah Admin', action: 'Authenticity confirmed' },
  { id: '12', caseId: 'DF-2024-0012', date: new Date('2024-03-12T16:45:00'), aiScore: 96, riskLevel: 'critical', analystName: 'John Analyst', action: 'High priority alert issued' },
];

export const auditLogs: AuditLog[] = [
  { id: '1', userId: 'user-1', userName: 'John Analyst', action: 'Case viewed', caseId: 'DF-2024-0001', timestamp: new Date('2024-03-18T10:00:00'), details: 'Viewed case details and analysis results' },
  { id: '2', userId: 'user-2', userName: 'Sarah Admin', action: 'Status changed', caseId: 'DF-2024-0002', timestamp: new Date('2024-03-17T15:00:00'), details: 'Changed status from "Open" to "Under Review"' },
  { id: '3', userId: 'user-1', userName: 'John Analyst', action: 'Report generated', caseId: 'DF-2024-0003', timestamp: new Date('2024-03-17T12:00:00'), details: 'Generated PDF analysis report' },
  { id: '4', userId: 'user-3', userName: 'Mike Investigator', action: 'Case viewed', caseId: 'DF-2024-0004', timestamp: new Date('2024-03-16T17:00:00'), details: 'Reviewed metadata analysis' },
  { id: '5', userId: 'user-2', userName: 'Sarah Admin', action: 'Case closed', caseId: 'DF-2024-0005', timestamp: new Date('2024-03-18T09:00:00'), details: 'Verified as authentic - case closed' },
];

export const reports: Report[] = [
  { id: '1', reportId: 'RPT-2024-0001', caseId: 'DF-2024-0001', generatedAt: new Date('2024-03-18T10:30:00'), generatedBy: 'John Analyst', fileSize: '2.4 MB' },
  { id: '2', reportId: 'RPT-2024-0002', caseId: 'DF-2024-0002', generatedAt: new Date('2024-03-17T15:45:00'), generatedBy: 'Sarah Admin', fileSize: '1.8 MB' },
  { id: '3', reportId: 'RPT-2024-0003', caseId: 'DF-2024-0003', generatedAt: new Date('2024-03-17T12:15:00'), generatedBy: 'John Analyst', fileSize: '2.1 MB' },
  { id: '4', reportId: 'RPT-2024-0004', caseId: 'DF-2024-0006', generatedAt: new Date('2024-03-15T14:30:00'), generatedBy: 'John Analyst', fileSize: '3.2 MB' },
  { id: '5', reportId: 'RPT-2024-0005', caseId: 'DF-2024-0009', generatedAt: new Date('2024-03-14T12:00:00'), generatedBy: 'John Analyst', fileSize: '2.7 MB' },
  { id: '6', reportId: 'RPT-2024-0006', caseId: 'DF-2024-0012', generatedAt: new Date('2024-03-12T17:30:00'), generatedBy: 'John Analyst', fileSize: '3.5 MB' },
];

export const weeklyActivity: WeeklyActivity[] = [
  { day: 'Mon', date: 'Mar 11', imagesAnalyzed: 45, deepfakesDetected: 8 },
  { day: 'Tue', date: 'Mar 12', imagesAnalyzed: 52, deepfakesDetected: 12 },
  { day: 'Wed', date: 'Mar 13', imagesAnalyzed: 38, deepfakesDetected: 5 },
  { day: 'Thu', date: 'Mar 14', imagesAnalyzed: 61, deepfakesDetected: 15 },
  { day: 'Fri', date: 'Mar 15', imagesAnalyzed: 48, deepfakesDetected: 9 },
  { day: 'Sat', date: 'Mar 16', imagesAnalyzed: 22, deepfakesDetected: 3 },
  { day: 'Sun', date: 'Mar 17', imagesAnalyzed: 35, deepfakesDetected: 7 },
];

export const dashboardStats: DashboardStats = {
  totalImagesAnalyzed: 301,
  deepfakesDetected: 59,
  highRiskCases: 23,
  averageAiConfidence: 67.4,
};

export const riskDistribution: RiskDistribution = {
  low: 35,
  medium: 28,
  high: 25,
  critical: 12,
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
