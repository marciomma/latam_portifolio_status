import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LATAM Portfolio Status",
  description: "Direct Market Portfolio Management Dashboard",
  generator: "v0.dev",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
