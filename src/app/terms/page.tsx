import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "Terms for using Aurora / Daily Tech Hub.",
};

export default function TermsPage() {
  return (
    <article className="mx-auto max-w-3xl space-y-6">
      <div>
        <p className="font-display text-xs font-bold uppercase tracking-[0.2em] text-[var(--signal)]">
          Legal
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-[var(--ink-fg)]">
          Terms of Use
        </h1>
        <p className="mt-2 text-sm text-[var(--muted)]">Last updated: September 11, 2026</p>
      </div>

      <div className="panel space-y-4 rounded-2xl p-6 text-sm leading-relaxed text-[var(--muted)]">
        <p>
          By creating an account or using Aurora (Daily Tech Hub), you agree to these terms. This
          is a short product terms page for an early free learning site — not a substitute for
          counsel-reviewed contracts.
        </p>
        <h2 className="font-display text-base font-bold text-[var(--ink-fg)]">The service</h2>
        <p>
          Aurora provides free educational content for data engineering and AI tooling. Features
          may change. We may suspend or remove accounts that abuse the service (spam, attacks,
          scraping that harms availability, or illegal use).
        </p>
        <h2 className="font-display text-base font-bold text-[var(--ink-fg)]">Your account</h2>
        <p>
          Keep your credentials safe. You are responsible for activity under your account. Content
          is for learning; do not treat it as professional advice for production systems without
          your own verification.
        </p>
        <h2 className="font-display text-base font-bold text-[var(--ink-fg)]">Closing an account</h2>
        <p>
          Email{" "}
          <a className="text-[var(--signal)] underline-offset-2 hover:underline" href="mailto:vponugoti0@gmail.com">
            vponugoti0@gmail.com
          </a>{" "}
          from the address on the account to ask us to delete it. Details are in the Privacy
          Policy. We may also close accounts that abuse the service.
        </p>
        <h2 className="font-display text-base font-bold text-[var(--ink-fg)]">Disclaimer</h2>
        <p>
          The site is provided “as is” without warranties. We are not liable for damages arising
          from use of the materials to the fullest extent allowed by law.
        </p>
        <p>
          Privacy details are in our{" "}
          <Link href="/privacy" className="text-[var(--signal)] underline-offset-2 hover:underline">
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </article>
  );
}
