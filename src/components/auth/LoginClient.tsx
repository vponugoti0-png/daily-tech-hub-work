"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { OAuthButtons } from "@/components/auth/OAuthButtons";
import { pushLocalProgressToServer } from "@/lib/progress";
import { authedFetch } from "@/lib/auth/client";
import { safeCallbackPath, signupHref } from "@/lib/safe-path";

function LoginForm({ oauthConfigured }: { oauthConfigured: import("@/lib/auth/oauth-providers").OAuthProviderId[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refresh } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const afterAuth = safeCallbackPath(searchParams.get("callbackUrl"));

  useEffect(() => {
    const err = searchParams.get("error");
    if (err) {
      setError(
        err === "Configuration"
          ? "OAuth provider is not configured. Set env vars from .env.example (see README)."
          : `OAuth sign-in error: ${err}`,
      );
    }
  }, [searchParams]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await authedFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Login failed");
        return;
      }
      await pushLocalProgressToServer();
      await refresh();
      router.push(afterAuth);
    } catch {
      setError("Network error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div>
        <p className="font-display text-xs font-bold uppercase tracking-[0.2em] text-[var(--signal)]">
          Welcome back
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-[var(--ink-fg)]">
          Sign in
        </h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Use email and password, or Continue with Google. Progress syncs when
          you&apos;re logged in.
        </p>
      </div>

      <div className="panel space-y-4 rounded-2xl p-6">
        <OAuthButtons initialConfigured={oauthConfigured} callbackUrl={afterAuth} />
        <div className="relative py-1 text-center text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
          <span className="relative z-10 bg-[var(--panel)] px-3">or email</span>
          <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-[var(--ink-border)]" />
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <label htmlFor="login-email" className="block text-sm">
            <span className="mb-1.5 block text-[var(--muted)]">Email</span>
            <input
              id="login-email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="field"
              autoComplete="email"
            />
          </label>
          <label htmlFor="login-password" className="block text-sm">
            <span className="mb-1.5 block text-[var(--muted)]">Password</span>
            <input
              id="login-password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="field"
              autoComplete="current-password"
            />
          </label>
          {error ? (
            <p role="alert" className="text-sm font-medium text-rose-600 dark:text-rose-400">
              {error}
            </p>
          ) : null}
          <button type="submit" disabled={busy} className="btn-primary w-full disabled:opacity-50">
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
      <p className="text-sm text-[var(--muted)]">
        New here?{" "}
        <Link href={signupHref(afterAuth)} className="text-[var(--signal)] underline-offset-2 hover:underline">
          Create a free account
        </Link>
      </p>
    </div>
  );
}

export function LoginClient({ oauthConfigured = [] }: { oauthConfigured?: import("@/lib/auth/oauth-providers").OAuthProviderId[] }) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-md text-sm text-[var(--muted)]">Loading sign-in…</div>
      }
    >
      <LoginForm oauthConfigured={oauthConfigured} />
    </Suspense>
  );
}
