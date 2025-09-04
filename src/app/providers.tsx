"use client";

import { ThemeProvider } from "next-themes";
import { PropsWithChildren } from "react";
import { Toaster } from "react-hot-toast";
import { QueryProvider } from "@/providers/query-provider";

export default function Providers({ children }: PropsWithChildren) {
  return (
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
  );
}
