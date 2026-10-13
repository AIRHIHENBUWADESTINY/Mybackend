"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signUpAction } from "@/lib/actions/auth";
import { initialAuthState } from "@/lib/actions/auth-types";

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(
    signUpAction,
    initialAuthState
  );

  return (
    <form action={formAction} className="flex w-full max-w-sm flex-col gap-4">
      {state.error ? (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-200">
          {state.error}
        </p>
      ) : null}

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="name"
          className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          required
          placeholder="Jane Doe"
          className="rounded-lg border border-sharpsave-steel-bg bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-sharpsave-green-dark focus:ring-2 focus:ring-sharpsave-green-dark/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-sharpsave-green-light"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="email"
          className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@example.com"
          className="rounded-lg border border-sharpsave-steel-bg bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-sharpsave-green-dark focus:ring-2 focus:ring-sharpsave-green-dark/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-sharpsave-green-light"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="password"
          className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          placeholder="At least 8 characters"
          className="rounded-lg border border-sharpsave-steel-bg bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-sharpsave-green-dark focus:ring-2 focus:ring-sharpsave-green-dark/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-sharpsave-green-light"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="dateOfBirth"
          className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Date of birth
        </label>
        <input
          id="dateOfBirth"
          name="dateOfBirth"
          type="date"
          autoComplete="bday"
          required
          className="rounded-lg border border-sharpsave-steel-bg bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-sharpsave-green-dark focus:ring-2 focus:ring-sharpsave-green-dark/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-sharpsave-green-light"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded-lg bg-sharpsave-green-dark px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sharpsave-green-light disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Creating account…" : "Create account"}
      </button>

      <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-sharpsave-green-dark underline-offset-4 hover:underline dark:text-sharpsave-green-light"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}