'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { EmployeeDialog } from '@/components/employee-dialog';
import { useEmployee, useUpdateEmployee } from '@/hooks/use-employees';
import { useToast } from '@/hooks/use-toast';
import { apiErrorMessage } from '@/lib/api';
import { initials } from '@/lib/utils';

export default function EmployeeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const employeeId = Number(id);
  const { data: employee, isLoading } = useEmployee(employeeId);
  const updateEmployee = useUpdateEmployee();
  const { push } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);

  const toggleStatus = () => {
    if (!employee) return;
    const next = employee.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    updateEmployee.mutate(
      { id: employeeId, status: next },
      {
        onSuccess: () => push({ title: next === 'ACTIVE' ? 'Employee activated' : 'Employee deactivated', variant: 'success' }),
        onError: (error) => push({ title: 'Could not update status', description: apiErrorMessage(error), variant: 'error' }),
      },
    );
  };

  if (isLoading || !employee) {
    return (
      <div className="mx-auto max-w-lg space-y-4">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <Link href="/admin/employees" className="inline-flex items-center gap-1 text-sm text-ink-secondary hover:text-ink-primary">
        <ArrowLeft className="h-4 w-4" /> Back to employees
      </Link>

      <Card>
        <CardHeader className="flex-row items-center gap-4 space-y-0">
          <Avatar className="h-16 w-16">
            <AvatarImage src={employee.photo_url ?? undefined} alt={employee.full_name} />
            <AvatarFallback className="text-lg">{initials(employee.full_name)}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle>{employee.full_name}</CardTitle>
            <p className="text-sm text-ink-secondary">{employee.position}</p>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <Row label="Email" value={employee.email} />
          <Row label="Department" value={employee.department.name} />
          <div className="flex items-center justify-between border-b border-border pb-2">
            <span className="text-ink-muted">Status</span>
            <div className="flex items-center gap-2">
              <Badge variant={employee.status === 'ACTIVE' ? 'present' : 'inactive'}>{employee.status}</Badge>
              <Switch checked={employee.status === 'ACTIVE'} onCheckedChange={toggleStatus} aria-label="Toggle active" />
            </div>
          </div>

          <Button className="w-full" variant="secondary" onClick={() => setDialogOpen(true)}>
            Edit details
          </Button>
        </CardContent>
      </Card>

      <EmployeeDialog open={dialogOpen} onOpenChange={setDialogOpen} employeeId={employeeId} />
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border pb-2">
      <span className="text-ink-muted">{label}</span>
      <span className="font-medium text-ink-primary">{value}</span>
    </div>
  );
}
