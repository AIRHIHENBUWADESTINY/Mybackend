"use client";

import { useFormStatus } from "react-dom";
import { logoutAction } from "@/lib/actions/auth";

function SignOutButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
    >
      {pending ? "Signing out…" : "Sign out"}
    </button>
  );
}

export function LogoutForm() {
  return (
    <form action={logoutAction}>
      <SignOutButton />
    </form>
  );
}