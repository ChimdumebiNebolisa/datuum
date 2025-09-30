import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from '@/components/ThemeProvider';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Datuum - Data Visualization Tool",
  description: "Create beautiful charts from your CSV data instantly. No backend required.",
  icons: {
    icon: "/icon.svg",
    shortcut: "/favicon.svg",
    apple: "/icon.svg",
  },
  manifest: "/manifest.json",
  keywords: ["data visualization", "charts", "CSV", "analytics", "graphs", "data analysis"],
  authors: [{ name: "Datuum Team" }],
  openGraph: {
    title: "Datuum - Data Visualization Tool",
    description: "Create beautiful charts from your CSV data instantly. No backend required.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Datuum - Data Visualization Tool",
    description: "Create beautiful charts from your CSV data instantly. No backend required.",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#3B82F6",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
