// Mirrors the backend's snake_case API contract exactly — see the naming
// rule in the README: data is snake_case, code is camelCase.

export type Role = 'ADMIN' | 'EMPLOYEE';
export type UserStatus = 'ACTIVE' | 'INACTIVE';
export type AttendanceStatus = 'PRESENT' | 'LATE';

export interface Department {
  id: number;
  name: string;
  created_at?: string;
  updated_at?: string;
  _count?: { employees: number };
}

export interface EmployeeSummary {
  id: number;
  full_name: string;
  position: string;
  photo_url: string | null;
  email: string;
  status: UserStatus;
  department: { id: number; name: string };
}

export interface AuthUser {
  id: number;
  email: string;
  role: Role;
  status: UserStatus;
  employee: {
    id: number;
    full_name: string;
    position: string;
    photo_url: string | null;
    department: { id: number; name: string };
  } | null;
}

export interface AttendanceRecord {
  id: number;
  work_date: string;
  clock_in_at: string;
  photo_url: string;
  latitude: number | null;
  longitude: number | null;
  status: AttendanceStatus;
  applied_late_tolerance_time: string;
  notes: string | null;
  employee: { id: number; full_name: string; department: { id: number; name: string } };
}

export interface AttendanceSettings {
  id: number;
  late_tolerance_time: string;
  require_location: boolean;
  updated_at: string;
  updated_by_id: number | null;
}

export interface DepartmentBreakdown {
  department_id: number;
  department_name: string;
  present: number;
  late: number;
}

export interface DashboardSummary {
  range: { start_date: string; end_date: string };
  active_employees: number;
  present: number;
  late: number;
  absent: number;
  on_time_rate: number;
  average_clock_in_time: string | null;
  by_department: DepartmentBreakdown[] | null;
}

export interface TrendPoint {
  work_date: string;
  present: number;
  late: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export interface Paginated<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface ApiErrorBody {
  statusCode: number;
  message: string | string[];
  timestamp: string;
}
