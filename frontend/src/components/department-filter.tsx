'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDepartments } from '@/hooks/use-departments';

interface DepartmentFilterProps {
  value: number | undefined;
  onChange: (value: number | undefined) => void;
}

/** Default is "all departments" — represented as an explicit "ALL" value
 * rather than undefined, since Radix Select cannot bind to an empty string. */
export function DepartmentFilter({ value, onChange }: DepartmentFilterProps) {
  const { data: departments } = useDepartments();
  const selectedLabel = value ? departments?.find((d) => d.id === value)?.name : 'All departments';

  return (
    <Select
      value={value ? String(value) : 'ALL'}
      onValueChange={(v) => onChange(v === 'ALL' ? undefined : Number(v))}
    >
      <SelectTrigger className="w-48">
        {/* Explicit children rather than relying on <SelectValue />'s
         * auto-lookup, which only knows a value's label once its SelectItem
         * has actually mounted (normally on first open) — a value set
         * before the dropdown was ever opened can otherwise render blank. */}
        <SelectValue placeholder="All departments">{selectedLabel}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="ALL">All departments</SelectItem>
        {departments?.map((dept) => (
          <SelectItem key={dept.id} value={String(dept.id)}>
            {dept.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
