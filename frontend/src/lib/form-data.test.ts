import { describe, expect, it } from 'vitest';
import { buildFormData } from './form-data';

describe('buildFormData', () => {
  it('stringifies scalar fields and skips undefined ones', () => {
    const form = buildFormData({ full_name: 'Saifudin', department_id: 3, active: undefined });
    expect(form.get('full_name')).toBe('Saifudin');
    expect(form.get('department_id')).toBe('3');
    expect(form.has('active')).toBe(false);
  });

  it('stringifies booleans explicitly, matching the backend enum-based coercion', () => {
    const form = buildFormData({ remove_photo: false });
    // Must be the literal string "false" — z.coerce.boolean() on the
    // backend would treat any non-empty string, including "false", as true.
    expect(form.get('remove_photo')).toBe('false');
  });

  it('appends the file under the given field name', () => {
    const blob = new Blob(['x'], { type: 'image/jpeg' });
    const form = buildFormData({}, { blob, filename: 'clock-in.jpg' });
    const file = form.get('file') as File;
    expect(file.name).toBe('clock-in.jpg');
    expect(file.type).toBe('image/jpeg');
  });
});
