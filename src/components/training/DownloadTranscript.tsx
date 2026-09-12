"use client";

import { Download } from "lucide-react";
import {
  downloadTextFile,
  transcriptJson,
  transcriptMarkdown,
} from "@/lib/l1-trophy";
import { loadProgress } from "@/lib/progress";

export function DownloadTranscript({
  heading = "Download transcript",
}: {
  heading?: string;
}) {
  function exportJson() {
    downloadTextFile(
      "aurora-transcript.json",
      transcriptJson(loadProgress()),
      "application/json",
    );
  }

  function exportMarkdown() {
    downloadTextFile(
      "aurora-transcript.md",
      transcriptMarkdown(loadProgress()),
      "text/markdown",
    );
  }

  return (
    <section
      data-testid="transcript-download"
      className="panel rounded-3xl p-5"
      aria-labelledby="transcript-download-heading"
    >
      <p className="font-display text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--sky)]">
        Guest progress
      </p>
      <h2
        id="transcript-download-heading"
        className="mt-1 font-display text-xl font-bold text-[var(--ink-fg)]"
      >
        {heading}
      </h2>
      <p className="mt-2 max-w-2xl text-sm text-[var(--muted)]">
        Export completed slug ids and this device&apos;s progress file. Nothing is issued by a
        server — this is your local record.
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          className="btn-primary inline-flex min-h-[44px]"
          data-testid="transcript-download-json"
          onClick={exportJson}
        >
          <Download className="h-4 w-4" aria-hidden />
          Download JSON
        </button>
        <button
          type="button"
          className="btn-ghost inline-flex min-h-[44px]"
          data-testid="transcript-download-md"
          onClick={exportMarkdown}
        >
          <Download className="h-4 w-4" aria-hidden />
          Download Markdown
        </button>
      </div>
    </section>
  );
}
