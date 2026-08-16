'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search } from 'lucide-react';
import { DataTable, type DataTableColumn } from '@/components/data-table';
import { DepartmentFilter } from '@/components/department-filter';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { EmployeeDialog } from '@/components/employee-dialog';
import { useEmployees, useUpdateEmployee } from '@/hooks/use-employees';
import { useToast } from '@/hooks/use-toast';
import { apiErrorMessage } from '@/lib/api';
import { initials } from '@/lib/utils';
import type { EmployeeSummary, UserStatus } from '@/types/api';

const PAGE_SIZE = 10;

export default function AdminEmployeesPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [departmentId, setDepartmentId] = useState<number | undefined>(undefined);
  const [status, setStatus] = useState<UserStatus | 'ALL'>('ALL');
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | undefined>(undefined);

  const query = useEmployees({
    search: search || undefined,
    department_id: departmentId,
    status: status === 'ALL' ? undefined : status,
    page,
    limit: PAGE_SIZE,
  });
  const updateEmployee = useUpdateEmployee();
  const { push } = useToast();

  const openCreate = () => {
    setEditingId(undefined);
    setDialogOpen(true);
  };
  const openEdit = (id: number) => {
    setEditingId(id);
    setDialogOpen(true);
  };

  const toggleStatus = (employee: EmployeeSummary) => {
    const next: UserStatus = employee.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    updateEmployee.mutate(
      { id: employee.id, status: next },
      {
        onSuccess: () =>
          push({
            title: next === 'ACTIVE' ? 'Employee activated' : 'Employee deactivated',
            variant: 'success',
          }),
        onError: (error) => push({ title: 'Could not update status', description: apiErrorMessage(error), variant: 'error' }),
      },
    );
  };

  const columns: DataTableColumn<EmployeeSummary>[] = [
    {
      key: 'name',
      header: 'Employee',
      cell: (e) => (
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={e.photo_url ?? undefined} alt={e.full_name} />
            <AvatarFallback>{initials(e.full_name)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-ink-primary">{e.full_name}</p>
            <p className="text-xs text-ink-muted">{e.email}</p>
          </div>
        </div>
      ),
    },
    { key: 'position', header: 'Position', cell: (e) => e.position, className: 'whitespace-nowrap' },
    { key: 'department', header: 'Department', cell: (e) => e.department.name, className: 'whitespace-nowrap' },
    {
      key: 'status',
      header: 'Status',
      cell: (e) => <Badge variant={e.status === 'ACTIVE' ? 'present' : 'inactive'}>{e.status}</Badge>,
      className: 'whitespace-nowrap',
    },
    {
      key: 'actions',
      header: 'Actions',
      cell: (e) => (
        <div className="flex items-center gap-4" onClick={(evt) => evt.stopPropagation()}>
          <Switch checked={e.status === 'ACTIVE'} onCheckedChange={() => toggleStatus(e)} aria-label="Toggle active" />
          <Button variant="ghost" size="sm" onClick={() => router.push(`/admin/employees/${e.id}`)}>
            View
          </Button>
          <Button variant="ghost" size="sm" onClick={() => openEdit(e.id)}>
            Edit
          </Button>
        </div>
      ),
      className: 'whitespace-nowrap',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-semibold text-ink-primary">Employees</h1>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" /> Add employee
        </Button>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
          <Input
            placeholder="Search by name or email"
            className="pl-9"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <DepartmentFilter value={departmentId} onChange={(v) => { setDepartmentId(v); setPage(1); }} />
        <Select value={status} onValueChange={(v) => { setStatus(v as UserStatus | 'ALL'); setPage(1); }}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All statuses</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="INACTIVE">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={query.data?.data ?? []}
        keyFor={(e) => e.id}
        isLoading={query.isLoading}
        emptyMessage="No employees match these filters."
        onRowClick={(e) => router.push(`/admin/employees/${e.id}`)}
      />

      {query.data && query.data.meta.total > 0 && (
        <div className="flex items-center justify-between text-sm text-ink-secondary">
          <span>
            Page {query.data.meta.page} of {query.data.meta.total_pages} ({query.data.meta.total} employees)
          </span>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              Previous
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={page >= query.data.meta.total_pages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      <EmployeeDialog open={dialogOpen} onOpenChange={setDialogOpen} employeeId={editingId} />
    </div>
  );
}
