'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2 } from 'lucide-react';
import { DataTable, type DataTableColumn } from '@/components/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useCreateDepartment, useDeleteDepartment, useDepartments, useUpdateDepartment } from '@/hooks/use-departments';
import { useToast } from '@/hooks/use-toast';
import { apiErrorMessage } from '@/lib/api';
import { departmentSchema, type DepartmentFormValues } from '@/schemas/department.schema';
import type { Department } from '@/types/api';

export default function AdminDepartmentsPage() {
  const { data: departments, isLoading } = useDepartments();
  const createDepartment = useCreateDepartment();
  const updateDepartment = useUpdateDepartment();
  const deleteDepartment = useDeleteDepartment();
  const { push } = useToast();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Department | null>(null);

  const form = useForm<DepartmentFormValues>({ resolver: zodResolver(departmentSchema) });

  const openCreate = () => {
    setEditing(null);
    form.reset({ name: '' });
    setDialogOpen(true);
  };
  const openEdit = (dept: Department) => {
    setEditing(dept);
    form.reset({ name: dept.name });
    setDialogOpen(true);
  };

  const onSubmit = form.handleSubmit((values) => {
    const mutation = editing
      ? updateDepartment.mutateAsync({ id: editing.id, ...values })
      : createDepartment.mutateAsync(values);

    mutation
      .then(() => {
        push({ title: editing ? 'Department updated' : 'Department created', variant: 'success' });
        setDialogOpen(false);
      })
      .catch((error) => push({ title: 'Could not save department', description: apiErrorMessage(error), variant: 'error' }));
  });

  const handleDelete = (dept: Department) => {
    if (!confirm(`Delete "${dept.name}"? This only works if no employees are assigned to it.`)) return;
    deleteDepartment.mutate(dept.id, {
      onSuccess: () => push({ title: 'Department deleted', variant: 'success' }),
      onError: (error) => push({ title: 'Could not delete department', description: apiErrorMessage(error), variant: 'error' }),
    });
  };

  const columns: DataTableColumn<Department>[] = [
    { key: 'name', header: 'Name', cell: (d) => <span className="font-medium text-ink-primary">{d.name}</span> },
    { key: 'employees', header: 'Employees', cell: (d) => d._count?.employees ?? 0 },
    {
      key: 'actions',
      header: 'Actions',
      cell: (d) => (
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="sm" onClick={() => openEdit(d)}>
            Edit
          </Button>
          <Button variant="ghost" size="sm" onClick={() => handleDelete(d)} aria-label={`Delete ${d.name}`}>
            <Trash2 className="h-4 w-4 text-status-absent" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-ink-primary">Departments</h1>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" /> Add department
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={departments ?? []}
        keyFor={(d) => d.id}
        isLoading={isLoading}
        emptyMessage="No departments yet."
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit department' : 'Add department'}</DialogTitle>
            <DialogDescription>Department names must be unique.</DialogDescription>
          </DialogHeader>
          <form onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col">
            <DialogBody>
              <div className="space-y-1.5">
                <Label htmlFor="name">Name</Label>
                <Input id="name" {...form.register('name')} />
                {form.formState.errors.name && (
                  <p className="text-xs text-status-absent">{form.formState.errors.name.message}</p>
                )}
              </div>
            </DialogBody>
            <DialogFooter>
              <Button type="button" variant="secondary" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" loading={createDepartment.isPending || updateDepartment.isPending}>
                {editing ? 'Save changes' : 'Create department'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
