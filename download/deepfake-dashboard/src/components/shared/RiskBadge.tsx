'use client';

import { Badge } from '@/components/ui/badge';
import { RiskLevel } from '@/types';
import { cn } from '@/lib/utils';

interface RiskBadgeProps {
  level: RiskLevel;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const riskConfig: Record<string, { label: string; className: string }> = {
  LOW: { label: 'Low', className: 'bg-green-500 hover:bg-green-600 text-white' },
  low: { label: 'Low', className: 'bg-green-500 hover:bg-green-600 text-white' },
  MEDIUM: { label: 'Medium', className: 'bg-orange-500 hover:bg-orange-600 text-white' },
  medium: { label: 'Medium', className: 'bg-orange-500 hover:bg-orange-600 text-white' },
  HIGH: { label: 'High', className: 'bg-red-500 hover:bg-red-600 text-white' },
  high: { label: 'High', className: 'bg-red-500 hover:bg-red-600 text-white' },
  CRITICAL: { label: 'Critical', className: 'bg-red-800 hover:bg-red-900 text-white' },
  critical: { label: 'Critical', className: 'bg-red-800 hover:bg-red-900 text-white' },
};

export function RiskBadge({ level, showLabel = true, size = 'md' }: RiskBadgeProps) {
  // Safety guard: if level is missing, default to LOW
  const config = riskConfig[level] || riskConfig.LOW;

  const sizeConfig = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-2',
  };

  return (
    <Badge
      className={cn(
        config.className,
        sizeConfig[size],
        'font-semibold uppercase tracking-wide'
      )}
    >
      {showLabel && config.label}
    </Badge>
  );
}

export function getRiskColor(level: RiskLevel): string {
  return (riskConfig[level] || riskConfig.LOW).className;
}