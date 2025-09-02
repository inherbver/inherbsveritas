"use client";

// import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { PropsWithChildren } from "react";
import { Toaster } from "react-hot-toast";
import { QueryProvider } from "@/providers/query-provider";

export default function Providers({ children }: PropsWithChildren) {
  return (
    // TODO: Re-enable SessionProvider when NextAuth/Supabase auth is configured (Semaine 2 MVP)
    // <SessionProvider>
      <QueryProvider>
        <ThemeProvider
          attribute="class"
          enableSystem={false}
          defaultTheme="light"
        >
          <Toaster />

          {children}
        </ThemeProvider>
      </QueryProvider>
    // </SessionProvider>
  );
}
