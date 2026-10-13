import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Account deleted",
  description: "Your Destiny Expense Manager account and expenses were deleted.",
  robots: { index: false, follow: false },
};

export default function AccountDeletedPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-24">
      <div className="flex max-w-md flex-col items-center gap-6 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
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
