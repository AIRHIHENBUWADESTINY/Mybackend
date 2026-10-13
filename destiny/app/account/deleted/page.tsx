import type { Metadata } from "next";
import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";
import { APP_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "Account deleted",
  description: `Your ${APP_NAME} account and expenses were deleted.`,
  robots: { index: false, follow: false },
};

export default function AccountDeletedPage() {
  return (
    <main className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-6 py-24">
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-white via-sharpsave-diamond-blue/40 to-sharpsave-diamond-blue"
        aria-hidden="true"
      />

      <BrandMark className="mb-8" />

      <div className="flex w-full max-w-md flex-col items-center gap-6 rounded-2xl border border-sharpsave-steel-bg bg-white p-8 text-center shadow-xl shadow-sharpsave-green-dark/5">
        <h1 className="text-2xl font-semibold tracking-tight text-sharpsave-green-dark">
          Your account is gone
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Your profile and all recorded expenses were permanently deleted.
        </p>
        <Link
          href="/register"
          className="rounded-lg bg-sharpsave-green-dark px-6 py-3 text-sm font-semibold text-white transition hover:bg-sharpsave-green-light"
        >
          Create a new account
        </Link>
      </div>
    </main>
  );
}
