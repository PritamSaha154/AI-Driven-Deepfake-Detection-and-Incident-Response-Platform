import { Badge } from '@/components/ui/badge';
import { CaseStatus } from '@/types';
import { cn } from '@/lib/utils';
import { Lock, Unlock, Search, CheckCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: CaseStatus;
  size?: 'sm' | 'md' | 'lg';
}

const statusConfig = {
  open: {
    label: 'Open Access',
    icon: Unlock,
    className: 'bg-emerald-500 hover:bg-emerald-600 text-white border-none',
  },
  locked: {
    label: 'Secure Locked',
    icon: Lock,
    // Added a red glow effect for the "Locked" status to stand out in the logs
    className: 'bg-red-600 hover:bg-red-700 text-white border-none animate-pulse shadow-[0_0_10px_rgba(220,38,38,0.5)]',
  },
  under_review: {
    label: 'Under Review',
    icon: Search,
    className: 'bg-amber-500 hover:bg-amber-600 text-white border-none',
  },
  closed: {
    label: 'Archived',
    icon: CheckCircle,
    className: 'bg-slate-500 hover:bg-slate-600 text-white border-none',
  },
};

const sizeConfig = {
  sm: 'text-[10px] px-2 py-0.5 gap-1',
  md: 'text-xs px-3 py-1 gap-1.5',
  lg: 'text-sm px-4 py-2 gap-2',
};

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  // Fallback to 'open' if status is undefined or missing from config
  const config = statusConfig[status] || statusConfig.open;
  const Icon = config.icon;

  return (
    <Badge
      className={cn(
        config.className,
        sizeConfig[size],
        'font-black uppercase tracking-tighter transition-all flex items-center w-fit'
      )}
    >
      <Icon className={cn(
        size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-3.5 h-3.5' : 'w-4 h-4'
      )} />
      {config.label}
    </Badge>
  );
}