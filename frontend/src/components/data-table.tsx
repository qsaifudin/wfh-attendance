import { ReactNode } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export interface DataTableColumn<T> {
  key: string;
  header: string;
  cell: (row: T) => ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  keyFor: (row: T) => string | number;
  isLoading?: boolean;
  emptyMessage?: string;
  /** Optional mobile card renderer — defaults to a stacked label/value list
   * built from the same columns. Dense tables are unusable on phones, so
   * this component never falls back to a horizontally-scrolling table below md. */
  renderCard?: (row: T) => ReactNode;
  onRowClick?: (row: T) => void;
}

export function DataTable<T>({
  columns,
  data,
  keyFor,
  isLoading,
  emptyMessage = 'Nothing to show yet.',
  renderCard,
  onRowClick,
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-ink-muted">
        {emptyMessage}
      </div>
    );
  }

  return (
    <>
      {/* Table — md and up */}
      <div className="hidden overflow-x-auto rounded-lg border border-border md:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-plane text-xs uppercase tracking-wide text-ink-muted">
            <tr>
              {columns.map((col) => (
                <th key={col.key} className={cn('px-4 py-3.5 font-medium', col.className)}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr
                key={keyFor(row)}
                onClick={() => onRowClick?.(row)}
                className={cn(
                  'border-t border-border',
                  onRowClick && 'cursor-pointer hover:bg-surface-plane',
                )}
              >
                {columns.map((col) => (
                  <td key={col.key} className={cn('px-4 py-3.5 align-middle', col.className)}>
                    {col.cell(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Cards — below md */}
      <div className="space-y-2 md:hidden">
        {data.map((row) =>
          renderCard ? (
            <div
              key={keyFor(row)}
              onClick={() => onRowClick?.(row)}
              className={cn('rounded-lg border border-border p-4', onRowClick && 'cursor-pointer')}
            >
              {renderCard(row)}
            </div>
          ) : (
            <div
              key={keyFor(row)}
              onClick={() => onRowClick?.(row)}
              className={cn('space-y-1.5 rounded-lg border border-border p-4', onRowClick && 'cursor-pointer')}
            >
              {columns.map((col) => (
                <div key={col.key} className="flex items-center justify-between gap-2 text-sm">
                  <span className="text-ink-muted">{col.header}</span>
                  <span className="text-right text-ink-primary">{col.cell(row)}</span>
                </div>
              ))}
            </div>
          ),
        )}
      </div>
    </>
  );
}
