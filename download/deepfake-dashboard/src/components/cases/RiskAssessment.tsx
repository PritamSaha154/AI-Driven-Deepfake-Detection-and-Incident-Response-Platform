'use client';

import { AlertTriangle, CheckCircle, Info, ShieldAlert } from 'lucide-react';
import { RiskBadge } from '@/components/shared/RiskBadge';
import type { RiskLevel } from '@/types';
import { cn } from '@/lib/utils';

interface RiskAssessmentProps {
  riskLevel: RiskLevel;
  riskScore: number;
  recommendations: string[];
}

const riskIcons: Record<RiskLevel, React.ComponentType<{ className?: string }>> = {
  low: CheckCircle,
  medium: Info,
  high: AlertTriangle,
  critical: ShieldAlert,
};

const riskColors: Record<RiskLevel, { bg: string; border: string; text: string }> = {
  low: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-700',
  },
  medium: {
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    text: 'text-orange-700',
  },
  high: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-700',
  },
  critical: {
    bg: 'bg-red-100',
    border: 'border-red-300',
    text: 'text-red-800',
  },
};

export function RiskAssessment({
  riskLevel,
  riskScore,
  recommendations,
}: RiskAssessmentProps) {
  const Icon = riskIcons[riskLevel];
  const colors = riskColors[riskLevel];

  return (
    <div className="space-y-4">
      {/* Risk Level Display */}
      <div
        className={cn(
          'flex items-center justify-between p-4 rounded-lg border',
          colors.bg,
          colors.border
        )}
      >
        <div className="flex items-center gap-3">
          <Icon className={cn('w-6 h-6', colors.text)} />
          <div>
            <p className="text-sm font-medium text-gray-600">Risk Assessment</p>
            <RiskBadge level={riskLevel} size="lg" />
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">Risk Score</p>
          <p className="text-2xl font-bold text-gray-900">
            {riskScore}
            <span className="text-sm font-normal text-gray-500">/10</span>
          </p>
        </div>
      </div>

      {/* Recommendations */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-3">
          Recommended Actions
        </h4>
        <ul className="space-y-2">
          {recommendations.map((rec, index) => (
            <li
              key={index}
              className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
            >
              <div
                className={cn(
                  'flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold',
                  riskLevel === 'critical' || riskLevel === 'high'
                    ? 'bg-red-500'
                    : 'bg-blue-500'
                )}
              >
                {index + 1}
              </div>
              <span className="text-sm text-gray-700">{rec}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
