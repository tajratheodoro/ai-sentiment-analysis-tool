import type { Metadata } from "next";
import type { ReactNode } from "react";

import { SiteHeader } from "@/components/site-header";
import { I18nProvider } from "@/lib/i18n";

import "./globals.css";

export const metadata: Metadata = {
  title: "Customer Satisfaction Score System",
  description: "AI/NLP customer feedback sentiment dashboard",
  icons: {
    icon: "/favico.webp",
  },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <I18nProvider>
          <SiteHeader />
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}
