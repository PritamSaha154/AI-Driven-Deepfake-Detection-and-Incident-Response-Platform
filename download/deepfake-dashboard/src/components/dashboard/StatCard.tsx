import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  iconClassName?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  className,
  iconClassName,
}: StatCardProps) {
  return (
    <Card className={cn('bg-white shadow-sm hover:shadow-md transition-shadow', className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            {subtitle && (
              <p className="text-sm text-gray-400 mt-1">{subtitle}</p>
            )}
            {trend && (
              <div className={cn(
                'flex items-center gap-1 mt-2 text-sm font-medium',
                trend.isPositive ? 'text-green-600' : 'text-red-600'
              )}>
                <span>{trend.isPositive ? '↑' : '↓'}</span>
                <span>{Math.abs(trend.value)}% from last week</span>
              </div>
            )}
          </div>
          <div className={cn(
            'p-3 rounded-lg bg-gray-50',
            iconClassName
          )}>
            <Icon className="w-6 h-6 text-gray-600" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
