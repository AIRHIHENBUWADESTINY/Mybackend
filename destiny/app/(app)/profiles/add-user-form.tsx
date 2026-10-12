"use client";

import { useActionState, useEffect, useRef } from "react";
import { addUserAction } from "@/lib/actions/profiles";
import { initialProfileState } from "@/lib/actions/profiles-types";
import { inputClass, labelClass, primaryButtonClass } from "@/lib/ui";

export function AddUserForm() {
  const [state, formAction, pending] = useActionState(
    addUserAction,
    initialProfileState
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.message) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-4">
      {state.error ? (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-200">
          {state.error}
        </p>
      ) : null}
      {state.message ? (
        <p className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200">
          {state.message}
        </p>
      ) : null}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="name" className={labelClass}>
          Full name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          autoComplete="off"
          required
          placeholder="Jane Doe"
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className={labelClass}>
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="off"
            required
            placeholder="jane@example.com"
            className={inputClass}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="dateOfBirth" className={labelClass}>
            Date of birth
          </label>
          <input
            id="dateOfBirth"
            name="dateOfBirth"
            type="date"
            autoComplete="off"
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="newUserPassword" className={labelClass}>
            Password for them
          </label>
          <input
            id="newUserPassword"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            placeholder="At least 8 characters"
            className={inputClass}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="yourPassword" className={labelClass}>
            Your password
          </label>
          <input
            id="yourPassword"
            name="currentPassword"
            type="password"
            autoComplete="current-password"
            required
            className={inputClass}
          />
        </div>
      </div>

      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        The new account is created already confirmed, so they can sign in
        immediately. Share the password with them directly.
      </p>

      <div>
        <button type="submit" disabled={pending} className={primaryButtonClass}>
          {pending ? "Creating…" : "Add account"}
        </button>
      </div>
    </form>
  );
}
