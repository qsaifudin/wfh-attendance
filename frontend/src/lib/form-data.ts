/** Builds multipart FormData from a flat field object plus an optional file
 * — every scalar is stringified, matching what the backend's Zod schemas
 * expect to coerce back from multipart input. `undefined` fields are
 * skipped so partial updates only send what actually changed. */
export function buildFormData(
  fields: Record<string, string | number | boolean | undefined>,
  file?: { blob: Blob; filename: string; fieldName?: string } | null,
): FormData {
  const form = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    if (value === undefined) continue;
    form.append(key, String(value));
  }
  if (file) {
    form.append(file.fieldName ?? 'file', file.blob, file.filename);
  }
  return form;
}
