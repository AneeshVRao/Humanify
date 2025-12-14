import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { QueryProvider } from "@/components/query-provider";
import { AnalyticsProvider } from "@/components/analytics-provider";
import { SpeedInsights } from "@vercel/speed-insights/next";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Humanify - Transform AI Text Into Natural Human Writing",
  description: "Turn AI-generated content into natural, human-sounding text instantly. Bypass AI detection with our advanced humanization tool. Try it free today.",
  keywords: ["AI humanizer", "AI detection", "content humanizer", "AI text converter"],
  authors: [{ name: "Humanify" }],
  openGraph: {
    title: "Humanify - AI Content Humanizer",
    description: "Transform AI text into natural, human-sounding writing",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={plusJakartaSans.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            <AnalyticsProvider>
              {children}
              <Toaster />
              <SpeedInsights />
            </AnalyticsProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
