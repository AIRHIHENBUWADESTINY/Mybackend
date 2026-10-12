"use client";

import { useActionState, useState } from "react";
import { removeUserAction } from "@/lib/actions/profiles";
import { initialProfileState } from "@/lib/actions/profiles-types";
import { formatDate } from "@/lib/format";
import type { ManagedAccount } from "@/lib/types/managed-account";
import { inputClass, labelClass } from "@/lib/ui";

const deleteButtonClass =
  "rounded-lg px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-60 dark:text-red-400 dark:hover:bg-red-950";

const cancelButtonClass =
  "rounded-lg px-3 py-2 text-sm font-semibold text-zinc-600 transition hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800";

function DeleteManagedUserForm({
  userId,
  name,
  onCancel,
}: {
  userId: string;
  name: string;
  onCancel: () => void;
}) {
  const [state, formAction, pending] = useActionState(
    removeUserAction,
    initialProfileState
  );

  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        if (!window.confirm(`Delete ${name}'s account?`)) {
          e.preventDefault();
        }
      }}
      className="flex flex-col gap-3"
    >
      {state.error ? (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-200">
          {state.error}
        </p>
      ) : null}

      <input type="hidden" name="userId" value={userId} />

      <div className="flex flex-col gap-1.5">
        <label htmlFor={`deletePassword-${userId}`} className={labelClass}>
          Your password
        </label>
        <input
          id={`deletePassword-${userId}`}
          name="currentPassword"
          type="password"
          autoComplete="current-password"
          required
          className={inputClass}
        />
      </div>

      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Deleting…" : "Delete account"}
        </button>
        <button type="button" onClick={onCancel} className={cancelButtonClass}>
          Cancel
        </button>
      </div>
    </form>
  );
}

function ManagedUserRow({
  account,
  revealed,
  onReveal,
  onCancel,
}: {
  account: ManagedAccount;
  revealed: boolean;
  onReveal: () => void;
  onCancel: () => void;
}) {
  return (
    <li className="flex flex-col gap-3 border-b border-zinc-100 px-4 py-3 last:border-b-0 dark:border-zinc-800">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            {account.full_name}
          </p>
          <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
            {account.email} · Added {formatDate(account.created_at)}
          </p>
        </div>
        {!revealed ? (
          <button
            type="button"
            onClick={onReveal}
            className={deleteButtonClass}
          >
            Delete
          </button>
        ) : null}
      </div>

      {revealed ? (
        <DeleteManagedUserForm
          userId={account.user_id}
          name={account.full_name}
          onCancel={onCancel}
        />
      ) : null}
    </li>
  );
}

export function ManagedUserList({ accounts }: { accounts: ManagedAccount[] }) {
  const [revealedId, setRevealedId] = useState<string | null>(null);

  if (accounts.length === 0) {
    return (
      <p className="rounded-xl border border-zinc-200 px-4 py-10 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
        No accounts added yet. Use the form above to create one.
      </p>
    );
  }

  return (
    <ul className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
      {accounts.map((account) => (
        <ManagedUserRow
          key={account.id}
          account={account}
          revealed={revealedId === account.id}
          onReveal={() => setRevealedId(account.id)}
          onCancel={() => setRevealedId(null)}
        />
      ))}
    </ul>
  );
}
