'use client'

import { ThemeProvider } from "@/components/theme-provider";
import { ReactNode } from "react";
import { Toaster } from "sonner";
import DuckdbProvider from "./duckdb-context";

interface ProvidersProps {
    children: ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
    return (
        <>
            <Toaster richColors position="top-right" /> <ThemeProvider attribute='class' defaultTheme='system' enableSystem disableTransitionOnChange>
                <DuckdbProvider>
                    {children}
                </DuckdbProvider>
            </ThemeProvider>
        </>
    )
}