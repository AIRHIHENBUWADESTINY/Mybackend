import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  APP_DESCRIPTION,
  APP_NAME,
  APP_POSITIONING,
  APP_TAGLINE,
  SITE_URL,
} from "@/lib/site";

const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: APP_NAME,
  slogan: APP_TAGLINE,
  description: APP_DESCRIPTION,
  url: SITE_URL,
  applicationCategory: "FinanceApplication",
  operatingSystem: "Web",
  browserRequirements: "Requires JavaScript",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "NGN",
  },
};

function Logo({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <span
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white ring-1 ring-sharpsave-green-dark/10 ${className}`}
    >
      <Image
        src="/favicon.ico"
        alt={`${APP_NAME} logo`}
        width={48}
        height={48}
        unoptimized
        className="h-full w-full object-contain"
      />
    </span>
  );
}

function ChatIcon() {
  return (
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
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function ChartIcon() {
  return (
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
      <path d="M3 3v18h18" />
      <path d="M7 15v-4" />
      <path d="M12 15V7" />
      <path d="M17 15v-6" />
    </svg>
  );
}

function SparkIcon() {
  return (
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
      <path d="M12 3v4" />
      <path d="M12 17v4" />
      <path d="M5.6 5.6l2.8 2.8" />
      <path d="M15.6 15.6l2.8 2.8" />
      <path d="M3 12h4" />
      <path d="M17 12h4" />
      <path d="M5.6 18.4l2.8-2.8" />
      <path d="M15.6 8.4l2.8-2.8" />
    </svg>
  );
}

function NairaIcon() {
  return (
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
      <path d="M6 4v16" />
      <path d="M18 4v16" />
      <path d="M6 9l12 6" />
      <path d="M6 15l12-6" />
    </svg>
  );
}

function ShieldIcon() {
  return (
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
      <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function CalendarIcon() {
  return (
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
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4" />
      <path d="M8 2v4" />
      <path d="M3 10h18" />
    </svg>
  );
}

const VALUE_PROPS: { title: string; body: string; icon: ReactNode }[] = [
  {
    title: "Log spending in seconds",
    body: "Add an expense by chatting in plain language or with a quick form — no spreadsheets, no friction.",
    icon: <ChatIcon />,
  },
  {
    title: "See exactly where it goes",
    body: "Daily and category breakdowns turn a month of transactions into one clear picture.",
    icon: <ChartIcon />,
  },
  {
    title: "AI-powered summaries",
    body: "Get a plain-language read on your habits and the categories where your spending climbs.",
    icon: <SparkIcon />,
  },
  {
    title: "Built for the naira",
    body: "Every amount is formatted in ₦ with thousands separators — naira-first from the ground up.",
    icon: <NairaIcon />,
  },
  {
    title: "Private by design",
    body: "Row-level security keeps your records tied to your account and invisible to everyone else.",
    icon: <ShieldIcon />,
  },
  {
    title: "Monthly clarity",
    body: "Jump between months, compare trends, and start each month already knowing your numbers.",
    icon: <CalendarIcon />,
  },
];

const STEPS = [
  {
    step: "01",
    title: "Create your account",
    body: "Sign up in under a minute. No card, no setup fee — just your email.",
  },
  {
    step: "02",
    title: "Log your spending",
    body: "Type a message like “spent 2,500 on fuel today” or use the form. Sharpsave does the parsing.",
  },
  {
    step: "03",
    title: "Read your month",
    body: "Get totals, category breakdowns, and an AI summary that tells you where to tighten up.",
  },
];

const STATS = [
  { value: "₦", label: "Naira-native tracking" },
  { value: "2", label: "Ways to log — chat or form" },
  { value: "100%", label: "Free to get started" },
  { value: "RLS", label: "Your data stays yours" },
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-sharpsave-diamond-blue text-sharpsave-text-primary">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <header className="sticky top-0 z-50 border-b border-sharpsave-green-dark/10 bg-white/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-3.5">
          <Link href="/" className="flex items-center gap-3">
            <Logo />
            <span className="text-lg font-bold tracking-tight text-sharpsave-green-dark">
              {APP_NAME}
            </span>
          </Link>

          <nav
            className="hidden items-center gap-8 text-sm font-medium text-sharpsave-green-dark/70 md:flex"
            aria-label="Section"
          >
            <a href="#features" className="transition hover:text-sharpsave-green-dark">
              Features
            </a>
            <a href="#how" className="transition hover:text-sharpsave-green-dark">
              How it works
            </a>
            <a href="#why" className="transition hover:text-sharpsave-green-dark">
              Why Sharpsave
            </a>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/login"
              className="rounded-lg px-3 py-2 text-sm font-semibold text-sharpsave-green-dark transition hover:bg-sharpsave-green-dark/5"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="btn-primary-sharpsave inline-flex items-center text-sm"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      <main className="flex flex-1 flex-col">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div
            className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-white via-sharpsave-diamond-blue to-sharpsave-diamond-blue"
            aria-hidden="true"
          />
          <div className="mx-auto grid w-full max-w-6xl items-center gap-14 px-6 py-20 lg:grid-cols-[1.05fr_0.95fr] lg:py-28">
            <div className="flex flex-col items-start gap-6">
              <span className="metric-badge-growth inline-flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-sharpsave-green-light" />
                AI-powered expense tracking
              </span>
              <h1 className="text-4xl font-extrabold leading-[1.05] tracking-tight text-sharpsave-green-dark sm:text-5xl lg:text-6xl">
                Track every naira.
                <br />
                <span className="bg-gradient-to-r from-sharpsave-green-light to-sharpsave-green-dark bg-clip-text text-transparent">
                  Save with precision.
                </span>
              </h1>
              <p className="max-w-xl text-lg leading-8 text-sharpsave-text-primary/70">
                {APP_DESCRIPTION}
              </p>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link
                  href="/register"
                  className="btn-primary-sharpsave inline-flex items-center justify-center text-base"
                >
                  Start tracking free
                </Link>
                <Link
                  href="#how"
                  className="inline-flex items-center justify-center rounded-lg border border-sharpsave-green-dark/20 bg-white px-6 py-3 text-sm font-semibold text-sharpsave-green-dark transition hover:border-sharpsave-green-dark/40 hover:bg-white/70"
                >
                  See how it works
                </Link>
              </div>

              <p className="text-sm text-sharpsave-text-primary/50">
                Free to use · No card required · Amounts in ₦
              </p>
            </div>

            {/* Product preview */}
            <div className="relative">
              <div
                className="absolute -inset-4 -z-10 rounded-3xl bg-gradient-to-tr from-sharpsave-green-light/20 via-transparent to-sharpsave-gold/20 blur-2xl"
                aria-hidden="true"
              />
              <div className="rounded-2xl border border-sharpsave-green-dark/10 bg-sharpsave-card-surface p-6 shadow-xl shadow-sharpsave-green-dark/5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-sharpsave-text-primary/40">
                      March total
                    </p>
                    <p className="mt-1 text-3xl font-bold text-sharpsave-green-dark">
                      ₦248,500.00
                    </p>
                  </div>
                  <span className="metric-badge-growth">▲ 12% under budget</span>
                </div>

                <div className="mt-6 space-y-4">
                  {[
                    { label: "Groceries", value: 82, amount: "₦92,000" },
                    { label: "Transport", value: 54, amount: "₦61,500" },
                    { label: "Utilities", value: 38, amount: "₦43,000" },
                    { label: "Data & airtime", value: 22, amount: "₦24,000" },
                  ].map((row) => (
                    <div key={row.label} className="space-y-1.5">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-sharpsave-text-primary/70">
                          {row.label}
                        </span>
                        <span className="font-semibold text-sharpsave-green-dark">
                          {row.amount}
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-sharpsave-green-dark/5">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-sharpsave-green-light to-sharpsave-green-dark"
                          style={{ width: `${row.value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex items-center gap-3 rounded-xl bg-sharpsave-green-dark/[0.04] p-3.5">
                  <span className="metric-badge-premium">AI</span>
                  <p className="text-sm text-sharpsave-text-primary/70">
                    Transport is your fastest-growing category this month.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats band */}
        <section className="border-y border-sharpsave-green-dark/10 bg-white">
          <div className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-6 px-6 py-10 sm:grid-cols-4">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center sm:text-left">
                <p className="text-2xl font-extrabold tracking-tight text-sharpsave-green-dark">
                  {stat.value}
                </p>
                <p className="mt-1 text-sm text-sharpsave-text-primary/55">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Value propositions */}
        <section id="features" className="scroll-mt-20 py-20 lg:py-24">
          <div className="mx-auto w-full max-w-6xl px-6">
            <div className="max-w-2xl">
              <span className="metric-badge-growth">Value</span>
              <h2 className="mt-4 text-3xl font-bold tracking-tight text-sharpsave-green-dark sm:text-4xl">
                Everything you need to understand your spending
              </h2>
              <p className="mt-4 text-lg leading-8 text-sharpsave-text-primary/65">
                {APP_POSITIONING}
              </p>
            </div>

            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {VALUE_PROPS.map((item) => (
                <div
                  key={item.title}
                  className="group rounded-2xl border border-sharpsave-green-dark/10 bg-sharpsave-card-surface p-6 transition hover:-translate-y-1 hover:border-sharpsave-green-light/40 hover:shadow-lg hover:shadow-sharpsave-green-dark/5"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-sharpsave-green-dark/5 text-sharpsave-green-dark transition group-hover:bg-sharpsave-green-dark group-hover:text-white">
                    {item.icon}
                  </span>
                  <h3 className="mt-5 text-lg font-bold text-sharpsave-green-dark">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-sharpsave-text-primary/65">
                    {item.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="scroll-mt-20 border-y border-sharpsave-green-dark/10 bg-white py-20 lg:py-24">
          <div className="mx-auto w-full max-w-6xl px-6">
            <div className="mx-auto max-w-2xl text-center">
              <span className="metric-badge-premium">How it works</span>
              <h2 className="mt-4 text-3xl font-bold tracking-tight text-sharpsave-green-dark sm:text-4xl">
                From scattered spending to a clear month
              </h2>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {STEPS.map((item) => (
                <div
                  key={item.step}
                  className="relative rounded-2xl border border-sharpsave-green-dark/10 bg-sharpsave-diamond-blue/50 p-6"
                >
                  <span className="text-sm font-extrabold tracking-widest text-sharpsave-gold">
                    {item.step}
                  </span>
                  <h3 className="mt-3 text-lg font-bold text-sharpsave-green-dark">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-sharpsave-text-primary/65">
                    {item.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Positioning */}
        <section id="why" className="scroll-mt-20 py-20 lg:py-24">
          <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-6 lg:grid-cols-2">
            <div>
              <span className="metric-badge-premium">Why Sharpsave</span>
              <h2 className="mt-4 text-3xl font-bold tracking-tight text-sharpsave-green-dark sm:text-4xl">
                Precision, not paperwork
              </h2>
              <p className="mt-5 text-lg leading-8 text-sharpsave-text-primary/70">
                Most expense apps drown you in fields and charts. Sharpsave is
                built around a simple promise: capture what you spend without
                thinking, then show you the truth about your month in plain
                language.
              </p>
              <ul className="mt-8 space-y-4">
                {[
                  "Log an expense in one line of text — no forms required.",
                  "Category and daily breakdowns you can actually read.",
                  "An AI summary that calls out where spending is drifting.",
                  "Naira formatting and privacy baked in from day one.",
                ].map((point) => (
                  <li key={point} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sharpsave-green-dark text-white">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-3 w-3"
                        aria-hidden="true"
                      >
                        <path d="m5 12 5 5L20 7" />
                      </svg>
                    </span>
                    <span className="text-base text-sharpsave-text-primary/75">
                      {point}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-sharpsave-green-dark/10 bg-sharpsave-card-surface p-8 shadow-xl shadow-sharpsave-green-dark/5">
              <p className="text-sm font-medium uppercase tracking-wider text-sharpsave-text-primary/40">
                Positioning
              </p>
              <p className="mt-3 text-xl font-semibold leading-8 text-sharpsave-green-dark">
                {APP_TAGLINE}
              </p>
              <p className="mt-4 text-base leading-7 text-sharpsave-text-primary/65">
                {APP_POSITIONING}
              </p>
              <Link
                href="/register"
                className="btn-primary-sharpsave mt-8 inline-flex items-center justify-center"
              >
                Create your free account
              </Link>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="bg-sharpsave-green-dark py-16 lg:py-20">
          <div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-6 px-6 text-center">
            <Logo className="h-14 w-14" />
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to save sharp?
            </h2>
            <p className="max-w-xl text-lg leading-8 text-white/70">
              Join {APP_NAME} and turn every naira you spend into a decision you
              can act on.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/register"
                className="inline-flex items-center justify-center rounded-lg bg-sharpsave-gold px-7 py-3 text-sm font-bold text-sharpsave-green-dark transition hover:brightness-105"
              >
                Get started free
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-lg border border-white/25 px-7 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Sign in
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-sharpsave-green-dark/10 bg-white">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row">
          <div className="flex items-center gap-3">
            <Logo className="h-8 w-8" />
            <span className="font-semibold text-sharpsave-green-dark">
              {APP_NAME}
            </span>
          </div>
          <p className="text-sm text-sharpsave-text-primary/50">
            {APP_TAGLINE}
          </p>
          <div className="flex items-center gap-6 text-sm font-medium text-sharpsave-green-dark/70">
            <Link href="/login" className="transition hover:text-sharpsave-green-dark">
              Sign in
            </Link>
            <Link
              href="/register"
              className="transition hover:text-sharpsave-green-dark"
            >
              Create account
            </Link>
          </div>
        </div>
        <div className="border-t border-sharpsave-green-dark/10 py-5 text-center text-xs text-sharpsave-text-primary/40">
          © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
