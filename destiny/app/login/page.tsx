import type { Metadata } from "next";
import { BrandMark } from "@/components/brand-mark";
import { APP_NAME, APP_TAGLINE } from "@/lib/site";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Sign in",
  description: `Sign in to ${APP_NAME} to track and manage your monthly expenses.`,
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>;
}) {
  const { message } = await searchParams;

  return (
    <main className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-6 py-16">
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-white via-sharpsave-diamond-blue/40 to-sharpsave-diamond-blue"
        aria-hidden="true"
      />

      <BrandMark className="mb-8" />

      <div className="w-full max-w-sm rounded-2xl border border-sharpsave-steel-bg bg-white p-7 shadow-xl shadow-sharpsave-green-dark/5">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-sharpsave-green-dark">
            Welcome back
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Sign in to continue to your dashboard.
          </p>
        </div>
        <LoginForm message={message} />
      </div>

      <p className="mt-6 text-xs text-zinc-500 dark:text-zinc-400">
        {APP_TAGLINE}
      </p>
    </main>
  );
}
