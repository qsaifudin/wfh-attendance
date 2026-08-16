import { redirect } from 'next/navigation';

// Middleware already redirects '/' based on session state — this is just a
// safety net so the route is never left unhandled.
export default function RootPage() {
  redirect('/login');
}
