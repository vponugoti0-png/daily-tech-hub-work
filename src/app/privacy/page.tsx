import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Aurora / Daily Tech Hub collects and uses account data.",
};

export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-3xl space-y-6">
      <div>
        <p className="font-display text-xs font-bold uppercase tracking-[0.2em] text-[var(--signal)]">
          Legal
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-[var(--ink-fg)]">
          Privacy Policy
        </h1>
        <p className="mt-2 text-sm text-[var(--muted)]">Last updated: September 11, 2026</p>
      </div>

      <div className="panel space-y-4 rounded-2xl p-6 text-sm leading-relaxed text-[var(--muted)]">
        <p>
          Aurora (Daily Tech Hub) is a free learning site. This page explains what we collect and
          why. It is a plain-language starter policy for the product — not formal legal advice.
        </p>
        <h2 className="font-display text-base font-bold text-[var(--ink-fg)]">What we collect</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>Account email, display name, and password hash (if you sign up with email).</li>
          <li>
            If you use Google, Microsoft, or X sign-in: name, email when the provider shares it, and
            that provider's account id (we do not receive your social-login password).
          </li>
          <li>Learning progress (lessons completed, quiz scores) tied to your account.</li>
          <li>Basic technical logs needed to run and secure the service (e.g. rate limits).</li>
        </ul>
        <h2 className="font-display text-base font-bold text-[var(--ink-fg)]">How we use it</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>To sign you in and keep your progress in sync.</li>
          <li>To operate, secure, and improve the site.</li>
          <li>We do not sell your personal data.</li>
        </ul>
        <h2 className="font-display text-base font-bold text-[var(--ink-fg)]">Cookies</h2>
        <p>
          We use essential session/auth cookies so you stay signed in. These are strictly necessary
          for the service. We do not currently set analytics or advertising cookies.
        </p>
        <h2 className="font-display text-base font-bold text-[var(--ink-fg)]">Third parties</h2>
        <p>
          We run the app on a cloud hosting provider (the project can be deployed on Fly.io or
          Railway) and store account plus progress data in SQLite on that host. If you choose
          social sign-in, that provider (Google, Microsoft, or X) also processes your login. Lesson
          content and your progress stay on our servers.
        </p>
        <h2 className="font-display text-base font-bold text-[var(--ink-fg)]">How long we keep data</h2>
        <p>
          We keep your account and learning progress while the account is active. In-memory rate
          limits and similar operational logs are short-lived and not a long-term profile. Session
          cookies expire on their own (short-lived access, longer refresh) or when you sign out.
          We do not publish a formal archival schedule beyond that.
        </p>
        <h2 className="font-display text-base font-bold text-[var(--ink-fg)]">Your choices</h2>
        <p>
          You can sign out anytime. To request access, an export, or deletion of your account and
          progress, email{" "}
          <a className="text-[var(--signal)] underline-offset-2 hover:underline" href="mailto:vponugoti0@gmail.com">
            vponugoti0@gmail.com
          </a>{" "}
          from the address on the account. Say that you want the account deleted. We will remove
          the user row and tied learning progress from our database. Social-login accounts at
          Google, Microsoft, or X are separate — revoke access there if you also want those
          connections closed.
        </p>
        <p>
          See also our{" "}
          <Link href="/terms" className="text-[var(--signal)] underline-offset-2 hover:underline">
            Terms of Use
          </Link>
          .
        </p>
      </div>
    </article>
  );
}
