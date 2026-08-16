'use client';

import { useEffect, useRef, useState } from 'react';
import { Upload } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ImageCropper } from '@/components/image-cropper';
import { initials } from '@/lib/utils';

interface AvatarUploadProps {
  currentUrl?: string | null;
  name: string;
  onPhotoSelected: (blob: Blob) => void;
  onPhotoRemoved: () => void;
  disabled?: boolean;
}

/** Picker + cropper + preview, wrapping ImageCropper. Photo is optional
 * everywhere — the fallback is initials, never a placeholder image. */
export function AvatarUpload({
  currentUrl,
  name,
  onPhotoSelected,
  onPhotoRemoved,
  disabled,
}: AvatarUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null | undefined>(currentUrl);
  const localEditRef = useRef(false);

  // Mirrors `currentUrl` for as long as the user hasn't made a local
  // change yet — this is what keeps the preview correct when the dialog is
  // reused for a different employee, or when the photo arrives a moment
  // after the dialog opens (an async query, not a prop the parent controls
  // synchronously).
  useEffect(() => {
    if (!localEditRef.current) setPreviewUrl(currentUrl);
  }, [currentUrl]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) setPendingFile(file);
    event.target.value = '';
  };

  const handleCropConfirm = (blob: Blob) => {
    localEditRef.current = true;
    if (previewUrl?.startsWith('blob:')) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(blob));
    onPhotoSelected(blob);
  };

  const handleRemove = () => {
    localEditRef.current = true;
    if (previewUrl?.startsWith('blob:')) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    onPhotoRemoved();
  };

  return (
    <div className="flex items-center gap-4">
      <Avatar className="h-16 w-16">
        {previewUrl && <AvatarImage src={previewUrl} alt={name} />}
        <AvatarFallback className="text-lg">{initials(name || '?')}</AvatarFallback>
      </Avatar>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
        >
          <Upload className="h-3.5 w-3.5" />
          {previewUrl ? 'Change photo' : 'Upload photo'}
        </Button>
        {previewUrl && (
          <Button type="button" variant="ghost" size="sm" disabled={disabled} onClick={handleRemove}>
            Remove
          </Button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png"
        className="hidden"
        onChange={handleFileChange}
      />
      <ImageCropper
        file={pendingFile}
        onConfirm={handleCropConfirm}
        onOpenChange={(open) => !open && setPendingFile(null)}
      />
    </div>
  );
}
