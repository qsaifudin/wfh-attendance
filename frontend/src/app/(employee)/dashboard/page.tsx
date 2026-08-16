'use client';

import { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import { CheckCircle2, Loader2, MapPin, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { CameraCapture } from '@/components/camera-capture';
import { LocationMap } from '@/components/location-map';
import { useMyAttendanceToday, useClockIn } from '@/hooks/use-attendance';
import { useAttendanceSettings } from '@/hooks/use-settings';
import { useGeolocation } from '@/hooks/use-geolocation';
import { useToast } from '@/hooks/use-toast';
import { apiErrorMessage } from '@/lib/api';

export default function EmployeeDashboardPage() {
  const today = useMyAttendanceToday();
  const settings = useAttendanceSettings();
  const clockIn = useClockIn();
  const { push } = useToast();
  const { state: geo, request: requestLocation } = useGeolocation();

  const [photo, setPhoto] = useState<Blob | null>(null);
  const [notes, setNotes] = useState('');

  const requireLocation = settings.data?.require_location ?? true;

  useEffect(() => {
    if (!settings.data) return;
    if (settings.data.require_location) requestLocation();
    // Only once settings resolve — the button re-enables itself via `geo`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.data?.require_location]);

  const locationReady = !requireLocation || geo.status === 'granted';
  const canSubmit = !!photo && locationReady && !clockIn.isPending;

  const handleSubmit = () => {
    if (!photo) return;
    clockIn.mutate(
      {
        photo,
        latitude: geo.status === 'granted' ? geo.latitude : undefined,
        longitude: geo.status === 'granted' ? geo.longitude : undefined,
        notes: notes.trim() || undefined,
      },
      {
        onSuccess: (record) => {
          push({
            title: 'Clocked in',
            description: `Marked ${record.status === 'LATE' ? 'late' : 'on time'} at ${format(new Date(record.clock_in_at), 'HH:mm')}.`,
            variant: 'success',
          });
        },
        onError: (error) => {
          push({ title: 'Clock-in failed', description: apiErrorMessage(error), variant: 'error' });
        },
      },
    );
  };

  const toleranceLabel = useMemo(() => {
    if (!settings.data) return null;
    return `Clock in by ${settings.data.late_tolerance_time} to be marked on time.`;
  }, [settings.data]);

  if (today.isLoading) {
    return (
      <div className="mx-auto max-w-lg space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (today.data) {
    const record = today.data;
    return (
      <div className="mx-auto max-w-lg space-y-4">
        <h1 className="text-xl font-semibold text-ink-primary">Today&apos;s attendance</h1>
        <Card>
          <CardContent className="space-y-4 p-5">
            <div className="flex items-center gap-2 text-status-present mt-4">
              <CheckCircle2 className="h-5 w-5" />
              <p className="font-medium text-ink-primary">You&apos;re all set for today.</p>
            </div>

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={record.photo_url}
              alt="Your clock-in proof"
              className="aspect-[4/3] w-full rounded-lg object-cover"
            />

            <div className="flex items-center justify-between text-sm">
              <span className="text-ink-secondary">Clocked in at</span>
              <span className="font-medium text-ink-primary">{format(new Date(record.clock_in_at), 'HH:mm')}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-ink-secondary">Status</span>
              <Badge variant={record.status === 'LATE' ? 'late' : 'present'}>{record.status}</Badge>
            </div>
            {record.latitude != null && record.longitude != null && (
              <LocationMap latitude={record.latitude} longitude={record.longitude} />
            )}
            {record.notes && <p className="text-sm text-ink-secondary">&ldquo;{record.notes}&rdquo;</p>}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-ink-primary">Clock in</h1>
        {toleranceLabel && <p className="text-sm text-ink-secondary">{toleranceLabel}</p>}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>1. Take a photo</CardTitle>
          <CardDescription>A live camera capture — no gallery uploads, no editing.</CardDescription>
        </CardHeader>
        <CardContent>
          <CameraCapture onCapture={setPhoto} onClear={() => setPhoto(null)} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>2. Confirm your location</CardTitle>
          <CardDescription>
            {requireLocation ? 'Required to clock in.' : 'Optional — location capture is currently off.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {geo.status === 'idle' || geo.status === 'requesting' ? (
            <Button type="button" variant="secondary" onClick={requestLocation} disabled={geo.status === 'requesting'}>
              {geo.status === 'requesting' ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
              {geo.status === 'requesting' ? 'Getting your location…' : 'Share my location'}
            </Button>
          ) : geo.status === 'granted' ? (
            <div className="flex items-center gap-2 text-sm text-ink-secondary">
              <MapPin className="h-4 w-4 text-status-present" />
              {geo.latitude.toFixed(5)}, {geo.longitude.toFixed(5)} (±{Math.round(geo.accuracy)}m)
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-status-absent">{geo.message}</p>
              <Button type="button" variant="secondary" size="sm" onClick={requestLocation}>
                <RefreshCw className="h-3.5 w-3.5" /> Retry
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>3. Notes (optional)</CardTitle>
        </CardHeader>
        <CardContent>
          <Label htmlFor="notes" className="sr-only">
            Notes
          </Label>
          <Textarea
            id="notes"
            placeholder="Anything HRD should know?"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            maxLength={500}
          />
        </CardContent>
      </Card>

      <Button className="w-full" size="lg" disabled={!canSubmit} loading={clockIn.isPending} onClick={handleSubmit}>
        Clock in now
      </Button>
    </div>
  );
}
