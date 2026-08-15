import type { Metadata, Viewport } from "next";
import { Inter, Geist_Mono, Unbounded } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import { ThemeProvider } from "@/components/theme-provider";
import { PackageBar } from "@/components/package-bar";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin", "cyrillic"],
});

const unbounded = Unbounded({
  variable: "--font-unbounded",
  subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
  title: "ВикТур — private-туры по Вьетнаму",
  description:
    "Индивидуальные private-туры по Нячангу, Камрани и Далату. Больше гостей — дешевле.",
};

// Сайт всегда в тёмной теме (forcedTheme="dark") — красим системный UI (статус-бар,
// шапку Chrome Custom Tab/Telegram in-app браузера) в тон фона, а не в серый по умолчанию,
// чтобы открытая по ссылке страница ощущалась как приложение, а не как "просто ссылка".
export const viewport: Viewport = {
  themeColor: "#0a0a0a",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ru"
      suppressHydrationWarning
      className={`${inter.variable} ${geistMono.variable} ${unbounded.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider attribute="class" defaultTheme="dark" forcedTheme="dark">
          {children}
          <PackageBar />
        </ThemeProvider>
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
        )}
      </body>
    </html>
  );
}
