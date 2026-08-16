import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  accent?: 'present' | 'late' | 'absent' | 'default';
  hint?: string;
}

const accentClasses: Record<NonNullable<StatCardProps['accent']>, string> = {
  present: 'text-status-present',
  late: 'text-status-late',
  absent: 'text-status-absent',
  default: 'text-ink-primary',
};

/** A KPI tile is a hero number, not a chart — large figure, label above,
 * hint beneath. */
export function StatCard({ label, value, icon: Icon, accent = 'default', hint }: StatCardProps) {
  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-3 p-4 sm:p-5">
        <div>
          <p className="text-sm text-ink-secondary">{label}</p>
          <p className={cn('mt-1 text-2xl font-semibold tabular-nums sm:text-3xl', accentClasses[accent])}>
            {value}
          </p>
          {hint && <p className="mt-1 text-xs text-ink-muted">{hint}</p>}
        </div>
        {Icon && (
          <div className="rounded-lg bg-surface-plane p-2">
            <Icon className={cn('h-5 w-5', accentClasses[accent])} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
