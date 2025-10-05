// src/app/about/layout.tsx
import AppHeader from "@/components/app-header";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "About | NASA Space Biology Knowledge Engine",
    description: "Learn about the AI-powered search platform for NASA space biology research papers.",
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen w-screen flex-col bg-background">
            <AppHeader />
            <main className="flex-1">{children}</main>
            <footer className="py-6 text-center text-sm text-muted-foreground">
                © {new Date().getFullYear()} NASA Space Biology Knowledge Engine. All rights reserved.
            </footer>
        </div>
    );
}
