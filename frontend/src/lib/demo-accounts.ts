// Must match backend/prisma/seed.ts exactly — these are throwaway demo
// credentials, not a secret, so showing the password on the login page
// helps a reviewer more than it costs. Gated by NEXT_PUBLIC_ENABLE_DEMO_LOGIN.

export interface DemoAccount {
  label: string;
  role: string;
  email: string;
  password: string;
  note?: string;
}

const DEMO_PASSWORD = 'attendance123';

export const DEMO_ACCOUNTS: DemoAccount[] = [
  { label: 'HRD Admin', role: 'ADMIN', email: 'admin@attendance.com', password: DEMO_PASSWORD },
  { label: 'Employee', role: 'EMPLOYEE', email: 'saifudin@attendance.com', password: DEMO_PASSWORD },
  {
    label: 'Deactivated employee',
    role: 'EMPLOYEE',
    email: 'nadia@attendance.com',
    password: DEMO_PASSWORD,
    note: 'Expected to fail — demonstrates the activate/deactivate feature.',
  },
];

export const DEMO_LOGIN_ENABLED = process.env.NEXT_PUBLIC_ENABLE_DEMO_LOGIN !== 'false';
