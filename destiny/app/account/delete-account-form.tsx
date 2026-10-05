"use client";

import { useActionState, useState } from "react";
import { deleteAccountAction } from "@/lib/actions/account";
import { initialAccountState } from "@/lib/actions/account-types";
import { dangerButtonClass, inputClass, labelClass } from "./ui";

const CONFIRMATION_PHRASE = "DELETE MY ACCOUNT";

export function DeleteAccountForm() {
  const [revealed, setRevealed] = useState(false);
  const [state, formAction, pending] = useActionState(
    deleteAccountAction,
    initialAccountState
  );

  if (!revealed) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Permanently delete your account and every expense attached to it. This
          cannot be undone.
        </p>
        <div>
          <button
            type="button"
            onClick={() => setRevealed(true)}
            className={dangerButtonClass}
          >
            Delete account
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        if (!window.confirm("This will permanently delete your account. Continue?")) {
          e.preventDefault();
        }
      }}
      className="flex flex-col gap-4"
    >
      {state.error ? (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-200">
          {state.error}
        </p>
      ) : null}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="deletePassword" className={labelClass}>
          Your password
        </label>
        <input
          id="deletePassword"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="confirmation" className={labelClass}>
          Type <span className="font-mono font-semibold">{CONFIRMATION_PHRASE}</span>{" "}
          to confirm
        </label>
        <input
          id="confirmation"
          name="confirmation"
          type="text"
          required
          placeholder={CONFIRMATION_PHRASE}
          className={inputClass}
        />
      </div>

      <div className="flex items-center gap-2">
        <button type="submit" disabled={pending} className={dangerButtonClass}>
          {pending ? "Deleting…" : "Permanently delete"}
        </button>
        <button
          type="button"
          onClick={() => setRevealed(false)}
          className="rounded-lg px-4 py-2.5 text-sm font-semibold text-zinc-600 transition hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
