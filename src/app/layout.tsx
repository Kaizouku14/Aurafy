import "@/styles/globals.css";

import { type Metadata } from "next";
import { Poppins } from "next/font/google";
import { Toaster } from "sileo";
import { TRPCReactProvider } from "@/trpc/react";
import { TooltipProvider } from "@/components/ui/tooltip";

import NextTopLoader from "nextjs-toploader";

export const metadata: Metadata = {
  title: "Aurafy: AI Music & Study Companion",
  description: "Your personalized study assistant, combining AI-generated flashcards, smart scheduling, Cornell notes, and mood-based Spotify playlists to help you focus and succeed.",
  icons: [{ rel: "icon", url: "/favicon.svg" }],
};

const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${poppins.variable}`}>
      <body>
        <NextTopLoader color="var(--main)" showSpinner={false} height={3} />
        <TRPCReactProvider>
          <TooltipProvider>{children}</TooltipProvider>
        </TRPCReactProvider>
        <Toaster
          position="top-right"
          options={{
            fill: "var(--main-foreground)",
          }}
        />
      </body>
    </html>
  );
}
