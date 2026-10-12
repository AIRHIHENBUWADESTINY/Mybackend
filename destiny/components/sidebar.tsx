"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useFormStatus } from "react-dom";
import type { ReactNode } from "react";
import { logoutAction } from "@/lib/actions/auth";
import { APP_NAME } from "@/lib/site";

function Logo() {
  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5"
        aria-hidden="true"
      >
        <path d="M12 2 4 7v6l8 5 8-5V7z" />
        <path d="M12 22v-9" />
        <path d="m4 7 8 6 8-6" />
      </svg>
    </span>
  );
}

function HomeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5 shrink-0"
      aria-hidden="true"
    >
      <path d="m3 10 9-7 9 7v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <path d="M9 22V12h6v10" />
    </svg>
  );
}

function ProfileIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5 shrink-0"
      aria-hidden="true"
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </svg>
  );
}

function HistoryIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5 shrink-0"
      aria-hidden="true"
    >
      <path d="M12 8v4l3 3" />
      <path d="M3.05 11a9 9 0 1 1 .5 4" />
      <path d="M3 4v4h4" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5 shrink-0"
      aria-hidden="true"
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="m16 17 5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  );
}

const NAV_ITEMS: { href: string; label: string; icon: ReactNode }[] = [
  { href: "/dashboard", label: "Home", icon: <HomeIcon /> },
  { href: "/account", label: "Profile", icon: <ProfileIcon /> },
  { href: "/history", label: "History", icon: <HistoryIcon /> },
];

const itemBase =
  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition";
const itemActive =
  "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900";
const itemInactive =
  "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100";

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function LogoutButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={`${itemBase} w-full ${itemInactive} disabled:cursor-not-allowed disabled:opacity-60`}
    >
      <LogoutIcon />
      <span className="hidden md:inline">
        {pending ? "Signing out…" : "Log Out"}
      </span>
    </button>
  );
}

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 flex h-screen w-16 shrink-0 flex-col border-r border-zinc-200 bg-white px-2.5 py-6 dark:border-zinc-800 dark:bg-zinc-900 md:w-60 md:px-4">
      <Link
        href="/dashboard"
        className="mb-8 flex items-center gap-3 rounded-lg px-1.5"
      >
        <Logo />
        <span className="hidden text-base font-semibold leading-tight tracking-tight md:inline">
          {APP_NAME}
        </span>
      </Link>

      <nav className="flex flex-1 flex-col gap-1" aria-label="Main">
        {NAV_ITEMS.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`${itemBase} ${active ? itemActive : itemInactive}`}
            >
              {item.icon}
              <span className="hidden md:inline">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <form
        action={logoutAction}
        className="mt-2 border-t border-zinc-200 pt-3 dark:border-zinc-800"
      >
        <LogoutButton />
      </form>
    </aside>
  );
}
