'use client';

import { useEffect, useRef } from 'react';
import { useForm, type UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AvatarUpload } from '@/components/avatar-upload';
import { useDepartments } from '@/hooks/use-departments';
import { useCreateEmployee, useEmployee, useUpdateEmployee } from '@/hooks/use-employees';
import { useToast } from '@/hooks/use-toast';
import { apiErrorMessage } from '@/lib/api';
import {
  createEmployeeSchema,
  updateEmployeeSchema,
  type CreateEmployeeFormValues,
  type UpdateEmployeeFormValues,
} from '@/schemas/employee.schema';
import type { Department } from '@/types/api';

interface EmployeeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employeeId?: number; // undefined = create mode
}

// The four fields below exist on both schemas with identical types, so a
// generic component can register() them against whichever concrete form is
// passed in — calling .register() on a *union* of the two form types is
// what TypeScript can't resolve, not on a generic type parameter.
interface SharedFields {
  full_name: string;
  position: string;
  department_id: number;
  status: 'ACTIVE' | 'INACTIVE';
}

function CommonFields<T extends SharedFields>({
  form,
  departments,
}: {
  form: UseFormReturn<T>;
  departments: Department[] | undefined;
}) {
  const departmentId = form.watch('department_id' as never) as unknown as number | undefined;
  const status = form.watch('status' as never) as unknown as 'ACTIVE' | 'INACTIVE' | undefined;

  return (
    <>
      <div className="space-y-1.5">
        <Label htmlFor="full_name">Full name</Label>
        <Input id="full_name" {...form.register('full_name' as never)} />
        {form.formState.errors.full_name && (
          <p className="text-xs text-status-absent">{form.formState.errors.full_name.message as string}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="position">Position</Label>
        <Input id="position" {...form.register('position' as never)} />
        {form.formState.errors.position && (
          <p className="text-xs text-status-absent">{form.formState.errors.position.message as string}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label>Department</Label>
        <Select
          value={departmentId ? String(departmentId) : undefined}
          onValueChange={(v) => form.setValue('department_id' as never, Number(v) as never, { shouldValidate: true })}
        >
          <SelectTrigger>
            {/* Explicit children rather than relying on <SelectValue />'s
             * auto-lookup, which only knows a value's label once its
             * SelectItem has actually mounted (normally on first open) —
             * edit mode sets this via form.reset() before the user has
             * ever opened the dropdown, so the lookup would render blank. */}
            <SelectValue placeholder="Select a department">
              {departments?.find((d) => d.id === departmentId)?.name}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {departments?.map((dept) => (
              <SelectItem key={dept.id} value={String(dept.id)}>
                {dept.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {form.formState.errors.department_id && (
          <p className="text-xs text-status-absent">{form.formState.errors.department_id.message as string}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label>Status</Label>
        <Select
          value={status ?? 'ACTIVE'}
          onValueChange={(v) => form.setValue('status' as never, v as never)}
        >
          <SelectTrigger>
            <SelectValue>{status === 'INACTIVE' ? 'Inactive' : 'Active'}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="INACTIVE">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </>
  );
}

export function EmployeeDialog({ open, onOpenChange, employeeId }: EmployeeDialogProps) {
  const isEdit = employeeId !== undefined;
  const { data: departments } = useDepartments();
  const { data: existing } = useEmployee(isEdit ? employeeId : null);
  const createEmployee = useCreateEmployee();
  const updateEmployee = useUpdateEmployee();
  const { push } = useToast();

  // A plain variable would reset on every re-render (every keystroke) and
  // silently drop the selected photo before submit — this has to survive
  // across renders without itself triggering one, hence a ref.
  const photoActionRef = useRef<Blob | null | undefined>(undefined);

  const createForm = useForm<CreateEmployeeFormValues>({
    resolver: zodResolver(createEmployeeSchema),
    defaultValues: { full_name: '', position: '', status: 'ACTIVE', email: '', password: '' },
  });
  const updateForm = useForm<UpdateEmployeeFormValues>({
    resolver: zodResolver(updateEmployeeSchema),
    defaultValues: { full_name: '', position: '', status: 'ACTIVE' },
  });

  useEffect(() => {
    if (!open) return;
    photoActionRef.current = undefined;
    if (isEdit && existing) {
      updateForm.reset({
        full_name: existing.full_name,
        position: existing.position,
        department_id: existing.department.id,
        status: existing.status,
      });
    } else if (!isEdit) {
      createForm.reset({ full_name: '', position: '', status: 'ACTIVE', email: '', password: '' });
    }
  }, [open, isEdit, existing]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSaved = () => {
    push({ title: isEdit ? 'Employee updated' : 'Employee created', variant: 'success' });
    onOpenChange(false);
  };
  const handleError = (error: unknown) =>
    push({ title: 'Could not save employee', description: apiErrorMessage(error), variant: 'error' });

  const onCreateSubmit = createForm.handleSubmit((values) => {
    createEmployee.mutate({ ...values, photo: photoActionRef.current }, { onSuccess: handleSaved, onError: handleError });
  });
  const onUpdateSubmit = updateForm.handleSubmit((values) => {
    updateEmployee.mutate(
      { id: employeeId!, ...values, photo: photoActionRef.current },
      { onSuccess: handleSaved, onError: handleError },
    );
  });

  const mutation = isEdit ? updateEmployee : createEmployee;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit employee' : 'Add employee'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Update this employee’s details.' : 'Creates a login and an employee record together.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={isEdit ? onUpdateSubmit : onCreateSubmit} className="flex min-h-0 flex-1 flex-col">
          <DialogBody>
            <AvatarUpload
              key={employeeId ?? 'create'}
              currentUrl={existing?.photo_url}
              name={(isEdit ? existing?.full_name : createForm.watch('full_name')) || ''}
              onPhotoSelected={(blob) => (photoActionRef.current = blob)}
              onPhotoRemoved={() => (photoActionRef.current = null)}
            />

            {isEdit ? (
              <CommonFields form={updateForm} departments={departments} />
            ) : (
              <>
                <CommonFields form={createForm} departments={departments} />
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" {...createForm.register('email')} />
                  {createForm.formState.errors.email && (
                    <p className="text-xs text-status-absent">{createForm.formState.errors.email.message}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="password">Temporary password</Label>
                  <PasswordInput id="password" autoComplete="new-password" {...createForm.register('password')} />
                  {createForm.formState.errors.password && (
                    <p className="text-xs text-status-absent">{createForm.formState.errors.password.message}</p>
                  )}
                </div>
              </>
            )}
          </DialogBody>

          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={mutation.isPending}>
              {isEdit ? 'Save changes' : 'Create employee'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
