// src/app/search/layout.tsx
import AppHeader from "@/components/app-header";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Search Papers | NASA Space Biology Explorer",
    description: "Search and analyze NASA space biology research papers with AI-powered insights.",
};

export default function SearchLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen w-screen justify-center flex-col bg-background">
            <AppHeader />
            <main className="flex-1">{children}</main>
        </div>
    );
}
