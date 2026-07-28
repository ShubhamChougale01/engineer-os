import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/components/AppShell";

export const metadata: Metadata = {
  title: {
    default: "AI Engineer OS",
    template: "%s · AI Engineer OS",
  },
  description:
    "The single place to learn every concept required to become a Senior AI Engineer — beginner to production, interviews to real systems.",
};

/**
 * Theme is applied before hydration via an inline script so there is never a
 * light-mode flash. Dark is the default; the toggle persists to localStorage.
 */
const themeInit = `
(function () {
  try {
    var t = localStorage.getItem("aeos:theme");
    if (t === "light") document.documentElement.classList.remove("dark");
    else document.documentElement.classList.add("dark");
  } catch (e) { document.documentElement.classList.add("dark"); }
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
