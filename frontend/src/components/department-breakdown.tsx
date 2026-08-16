'use client';

import { useDarkMode } from '@/hooks/use-dark-mode';
import { getChartColors } from '@/lib/chart-colors';
import type { DepartmentBreakdown } from '@/types/api';

/** Horizontal bars sorted by total, direct-labelled — simpler and more
 * legible than a legend-driven chart for four-or-fewer categories. */
export function DepartmentBreakdownChart({ data }: { data: DepartmentBreakdown[] }) {
  const isDark = useDarkMode();
  const colors = getChartColors(isDark);

  if (data.length === 0) {
    return <p className="text-sm text-ink-muted">No department data for this range yet.</p>;
  }

  const withTotal = data
    .map((row) => ({ ...row, total: row.present + row.late }))
    .sort((a, b) => b.total - a.total);
  const max = Math.max(1, ...withTotal.map((row) => row.total));

  return (
    <div className="space-y-3">
      {withTotal.map((row, index) => (
        <div key={row.department_id} className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="text-ink-primary">{row.department_name}</span>
            <span className="tabular-nums text-ink-secondary">
              {row.total} <span className="text-ink-muted">({row.present} present, {row.late} late)</span>
            </span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-surface-plane">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${(row.total / max) * 100}%`,
                backgroundColor: colors.dept[index % colors.dept.length],
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
