"use client";

/**
 * First focusable control in the document. Hash navigation alone does not
 * move keyboard focus in every browser (Safari), so activation also focuses
 * #main-content (tabIndex=-1 on <main>).
 */
export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="skip-link"
      onClick={() => {
        const main = document.getElementById("main-content");
        if (main instanceof HTMLElement) {
          main.focus();
        }
      }}
    >
      Skip to content
    </a>
  );
}
