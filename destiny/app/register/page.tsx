import type { Metadata } from "next";
import { RegisterForm } from "./register-form";

export const metadata: Metadata = {
  title: "Create an account",
  description:
    "Create a free Destiny Expense Manager account and start tracking your monthly spending in naira.",
};

export default function RegisterPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-16">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-sharpsave-green-dark">
          Create your account
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Sign up to get started.
        </p>
      </div>
      <RegisterForm />
    </main>
  );
}