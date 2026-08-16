'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AvatarUpload } from '@/components/avatar-upload';
import { useCurrentUser } from '@/hooks/use-auth';
import { useUpdateMyPhoto } from '@/hooks/use-employees';
import { useToast } from '@/hooks/use-toast';
import { apiErrorMessage } from '@/lib/api';

export default function ProfilePage() {
  const { data: user, isLoading } = useCurrentUser();
  const updatePhoto = useUpdateMyPhoto();
  const { push } = useToast();

  if (isLoading || !user?.employee) {
    return (
      <div className="mx-auto max-w-lg space-y-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  const employee = user.employee;

  const handlePhotoSelected = (blob: Blob) => {
    updatePhoto.mutate(blob, {
      onSuccess: () => push({ title: 'Photo updated', variant: 'success' }),
      onError: (error) => push({ title: 'Could not update photo', description: apiErrorMessage(error), variant: 'error' }),
    });
  };

  const handlePhotoRemoved = () => {
    updatePhoto.mutate(null, {
      onSuccess: () => push({ title: 'Photo removed', variant: 'success' }),
      onError: (error) => push({ title: 'Could not remove photo', description: apiErrorMessage(error), variant: 'error' }),
    });
  };

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <h1 className="text-xl font-semibold text-ink-primary">Profile</h1>

      <Card>
        <CardHeader>
          <CardTitle>Photo</CardTitle>
          <CardDescription>Shown on your attendance records and to HRD.</CardDescription>
        </CardHeader>
        <CardContent>
          <AvatarUpload
            currentUrl={employee.photo_url}
            name={employee.full_name}
            onPhotoSelected={handlePhotoSelected}
            onPhotoRemoved={handlePhotoRemoved}
            disabled={updatePhoto.isPending}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
          <CardDescription>Set by HRD — reach out to them for changes.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <Row label="Full name" value={employee.full_name} />
          <Row label="Position" value={employee.position} />
          <Row label="Department" value={employee.department.name} />
          <Row label="Email" value={user.email} />
        </CardContent>
      </Card>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border pb-2 last:border-0 last:pb-0">
      <span className="text-ink-muted">{label}</span>
      <span className="font-medium text-ink-primary">{value}</span>
    </div>
  );
}
