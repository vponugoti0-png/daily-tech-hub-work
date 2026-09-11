import type { Metadata } from "next";
import { IBM_Plex_Mono, Space_Grotesk, Source_Sans_3 } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SkipLink } from "@/components/SkipLink";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { getDigest } from "@/lib/content";
import { formatDateTime } from "@/lib/dates";

const display = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const body = Source_Sans_3({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const mono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: {
    default: "Daily Tech Hub",
    template: "%s · Daily Tech Hub",
  },
  description:
    "Aurora — Daily Tech Hub for data engineers: prompt engineering, AI for DE, Snowflake, Databricks, Python, SQL, and Claude/Copilot/Grok shortcuts.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  const digest = getDigest();
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} ${mono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var th=localStorage.getItem('dth-theme');if(th==='dark'){document.documentElement.classList.add('dark')}else{document.documentElement.classList.remove('dark');document.documentElement.classList.remove('light')}if(localStorage.getItem('dth-plain-english')==='1')document.documentElement.dataset.plainEnglish='on'}catch(e){}})();`,
          }}
        />
      </head>
      <body className="flex min-h-full flex-col">
        <SkipLink />
        <AuthProvider>
          <Header />
          <main
            id="main-content"
            tabIndex={-1}
            className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-10"
          >
            {children}
          </main>
          <Footer lastUpdated={formatDateTime(digest.lastUpdated)} />
        </AuthProvider>
      </body>
    </html>
  );
}
