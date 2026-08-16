'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as Dialog from '@radix-ui/react-dialog';
import {
  CalendarCheck2,
  LayoutDashboard,
  Users,
  Building2,
  ClipboardList,
  Settings,
  UserCircle,
  Menu,
  LogOut,
  X,
} from 'lucide-react';
import { cn, initials } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useCurrentUser, useLogout } from '@/hooks/use-auth';
import type { LucideIcon } from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const ADMIN_NAV: NavItem[] = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/attendance', label: 'Attendance', icon: ClipboardList },
  { href: '/admin/employees', label: 'Employees', icon: Users },
  { href: '/admin/departments', label: 'Departments', icon: Building2 },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

const EMPLOYEE_NAV: NavItem[] = [
  { href: '/dashboard', label: 'Clock In', icon: LayoutDashboard },
  { href: '/attendance', label: 'History', icon: ClipboardList },
  { href: '/profile', label: 'Profile', icon: UserCircle },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: user } = useCurrentUser();
  const logout = useLogout();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const nav = user?.role === 'ADMIN' ? ADMIN_NAV : EMPLOYEE_NAV;
  const displayName = user?.employee?.full_name ?? user?.email ?? '';
  const photoUrl = user?.employee?.photo_url ?? undefined;

  const isActive = (href: string) =>
    href === '/admin' || href === '/dashboard' ? pathname === href : pathname.startsWith(href);

  return (
    <div className="min-h-screen bg-surface-plane md:flex">
      {/* Desktop sidebar — `md:sticky md:top-0 md:h-screen` keeps it pinned
       * to the viewport and capped at one screen tall. Without an explicit
       * height, a flex row's default `align-items: stretch` makes every
       * item match the tallest sibling — so once the content column grows
       * past one screen (e.g. a long paginated table), the sidebar would
       * stretch to match it too, and its profile/logout block at the
       * bottom would scroll away with the page instead of staying put.
       *
       * Icon-only between md and lg (a "mini" sidebar for a narrowed
       * desktop window or a laptop-size screen), full width with labels
       * from lg up — the content column next to it needs `min-w-0` for
       * this to actually help: without it, a wide table forces the flex
       * row itself wider than the viewport instead of scrolling
       * internally, which drags this sidebar sideways along with it. */}
      <aside className="scroll-soft hidden w-[72px] shrink-0 flex-col overflow-y-auto overflow-x-hidden bg-brand-primary text-white md:sticky md:top-0 md:flex md:h-screen lg:w-64">
        <div className="flex items-center justify-center gap-2 px-2 py-5 lg:justify-start lg:px-5">
          <CalendarCheck2 className="h-6 w-6 shrink-0 text-brand-accent" />
          <span className="hidden text-lg font-semibold lg:inline">Attendance</span>
        </div>
        <nav className="flex-1 space-y-1 px-2 lg:px-3">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              className={cn(
                'flex items-center justify-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white lg:justify-start',
                isActive(item.href) && 'bg-white/10 text-brand-accent',
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <span className="hidden lg:inline">{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="border-t border-white/10 p-2 lg:p-4">
          <div className="flex items-center justify-center gap-2 lg:justify-start">
            <Avatar className="h-9 w-9 shrink-0">
              <AvatarImage src={photoUrl} alt={displayName} />
              <AvatarFallback>{initials(displayName || 'U')}</AvatarFallback>
            </Avatar>
            <div className="hidden min-w-0 flex-1 lg:block">
              <p className="truncate text-sm font-medium text-white">{displayName}</p>
              <p className="truncate text-xs text-white/60">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={() => logout.mutate()}
            title="Log out"
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm text-white/70 hover:bg-white/10 hover:text-white lg:justify-start"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            <span className="hidden lg:inline">Log out</span>
          </button>
        </div>
      </aside>

      {/* `min-w-0` overrides the flex default of `min-width: auto`, which
       * refuses to shrink a flex item below its content's natural width —
       * without it, a wide table pushes this whole column (and the sidebar
       * beside it) wider than the viewport instead of letting the table's
       * own `overflow-x-auto` wrapper scroll internally. */}
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        {/* Mobile top bar */}
        <header className="flex items-center justify-between border-b border-border bg-brand-primary px-4 py-3 text-white md:hidden">
          <span className="text-base font-semibold">
            <span className="text-brand-accent">WFH</span> Attendance
          </span>
          <Dialog.Root open={drawerOpen} onOpenChange={setDrawerOpen}>
            <Dialog.Trigger asChild>
              <button aria-label="Open menu" className="rounded-md p-2 hover:bg-white/10">
                <Menu className="h-5 w-5" />
              </button>
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
              <Dialog.Content className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-brand-primary text-white">
                <Dialog.Title className="sr-only">Navigation</Dialog.Title>
                <div className="flex items-center justify-between px-5 py-5">
                  <span className="text-lg font-semibold">
                    <span className="text-brand-accent">WFH</span> Attendance
                  </span>
                  <Dialog.Close aria-label="Close menu" className="rounded-md p-1 hover:bg-white/10">
                    <X className="h-5 w-5" />
                  </Dialog.Close>
                </div>
                <div className="flex items-center gap-2 px-5 pb-4">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={photoUrl} alt={displayName} />
                    <AvatarFallback>{initials(displayName || 'U')}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{displayName}</p>
                    <p className="truncate text-xs text-white/60">{user?.email}</p>
                  </div>
                </div>
                <nav className="flex-1 space-y-1 px-3">
                  {nav.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setDrawerOpen(false)}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white',
                        isActive(item.href) && 'bg-white/10 text-brand-accent',
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  ))}
                </nav>
                <div className="border-t border-white/10 p-4">
                  <button
                    onClick={() => logout.mutate()}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/70 hover:bg-white/10 hover:text-white"
                  >
                    <LogOut className="h-4 w-4" />
                    Log out
                  </button>
                </div>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        </header>

        <main className="flex-1 p-4 sm:p-6">{children}</main>

        {/* Mobile bottom nav — `sticky`, not `fixed`. Fixed positioning
         * takes an element out of the document entirely, so `<main>` has to
         * separately guess how much bottom padding to reserve to avoid
         * being overlapped — that guess is exactly what was cutting off the
         * last bit of content on taller pages. `sticky` still reserves its
         * own real space at the end of the page (nothing can ever render
         * underneath it), while catching at the viewport's bottom edge
         * during scroll, so it stays reachable the same way a fixed nav
         * would. It's last in this flex column, so there's nothing after it
         * that a "stuck" nav could hide either. */}
        <nav className="sticky bottom-0 z-30 flex shrink-0 border-t border-border bg-surface-card md:hidden">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-medium text-ink-muted',
                isActive(item.href) && 'text-brand-accent-on-light',
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
