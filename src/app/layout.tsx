import type { Metadata } from "next";
// Self-hosted via @fontsource (npm packages, bundled at build time) instead of
// next/font/google, which needs a live connection to fonts.googleapis.com
// during `next build`. This keeps the build working in offline/restricted
// environments and avoids any runtime request to Google at all.
import "@fontsource/fraunces/500.css";
import "@fontsource/fraunces/600.css";
import "@fontsource/fraunces/700.css";
import "@fontsource/fraunces/500-italic.css";
import "@fontsource/fraunces/600-italic.css";
import "@fontsource/fraunces/700-italic.css";
import "@fontsource/nunito-sans/400.css";
import "@fontsource/nunito-sans/600.css";
import "@fontsource/nunito-sans/700.css";
import "@fontsource/nunito-sans/800.css";
import "@fontsource/caveat/600.css";
import "@fontsource/caveat/700.css";
import "./globals.css";
import { Nav } from "@/components/nav";

export const metadata: Metadata = {
  title: "Sundays — home-cooked Sunday supper",
  description: "Find or host a home-cooked Sunday supper in your neighbourhood.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-cream text-ink font-sans">
        <Nav />
        <main className="flex-1 flex flex-col">{children}</main>
      </body>
    </html>
  );
}
