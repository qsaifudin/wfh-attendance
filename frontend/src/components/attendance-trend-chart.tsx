'use client';

import { format } from 'date-fns';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useDarkMode } from '@/hooks/use-dark-mode';
import { getChartColors } from '@/lib/chart-colors';
import type { TrendPoint } from '@/types/api';

interface TrendTooltipProps {
  active?: boolean;
  label?: string;
  payload?: { value: number; dataKey: string }[];
}

function TrendTooltip({ active, label, payload }: TrendTooltipProps) {
  if (!active || !payload?.length || !label) return null;
  return (
    <div className="rounded-lg border border-border bg-surface-card p-2.5 text-xs shadow-lg">
      <p className="mb-1 font-medium text-ink-primary">{format(new Date(label), 'EEE, d MMM yyyy')}</p>
      {payload.map((entry) => (
        <p key={entry.dataKey} className="text-ink-secondary">
          {entry.dataKey === 'present' ? 'Present' : 'Late'}: <span className="font-medium text-ink-primary">{entry.value}</span>
        </p>
      ))}
    </div>
  );
}

export function AttendanceTrendChart({ data }: { data: TrendPoint[] }) {
  const isDark = useDarkMode();
  const colors = getChartColors(isDark);

  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-ink-muted">
        No attendance in this range yet.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }} barGap={2}>
        <CartesianGrid vertical={false} stroke={colors.grid} />
        <XAxis
          dataKey="work_date"
          tickFormatter={(value: string) => format(new Date(value), 'd MMM')}
          tick={{ fill: colors.axis, fontSize: 12 }}
          axisLine={{ stroke: colors.grid }}
          tickLine={false}
        />
        <YAxis allowDecimals={false} tick={{ fill: colors.axis, fontSize: 12 }} axisLine={false} tickLine={false} />
        <Tooltip content={<TrendTooltip />} cursor={{ fill: colors.grid, opacity: 0.4 }} />
        <Legend
          formatter={(value) => (value === 'present' ? 'Present' : 'Late')}
          wrapperStyle={{ fontSize: 12, color: colors.axis }}
        />
        <Bar dataKey="present" stackId="a" fill={colors.present} radius={[0, 0, 0, 0]} maxBarSize={28} />
        <Bar dataKey="late" stackId="a" fill={colors.late} radius={[4, 4, 0, 0]} maxBarSize={28} />
      </BarChart>
    </ResponsiveContainer>
  );
}
