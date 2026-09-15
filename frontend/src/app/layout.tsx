import type { Metadata, Viewport } from "next";
import { Sora, Inter, IBM_Plex_Sans } from "next/font/google";
import { ThemeProvider } from "@/providers/theme-provider";
import { SessionProvider } from "@/providers/session-provider";
import { QueryProvider } from "@/providers/query-provider";
import { AbilityProvider } from "@/providers/ability-provider";
import { PwaInstallPrompt } from "@/components/layout/pwa-install";
import { auth } from "@/lib/auth";
import "./globals.css";

const sora = Sora({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
});

const ibmPlexSans = IBM_Plex_Sans({
  variable: "--font-numbers",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
});

export const viewport: Viewport = {
  themeColor: "#4338CA",
};

export const metadata: Metadata = {
  title: "SOLUBRIX - Solutions That Build Futures",
  description:
    "Manage • Monitor • Grow - All-in-one Enterprise SaaS Business Operating System",
  manifest: "/manifest.json",
  keywords: [
    "ERP",
    "CRM",
    "HRMS",
    "Project Management",
    "Business OS",
    "Enterprise",
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  const role = session?.user?.role || "GUEST";
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${sora.variable} ${inter.variable} ${ibmPlexSans.variable}`}
    >
      <body className="min-h-screen bg-background font-body text-foreground antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <SessionProvider>
            <AbilityProvider role={role}>
              <QueryProvider>
                {children}
                <PwaInstallPrompt />
              </QueryProvider>
            </AbilityProvider>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
