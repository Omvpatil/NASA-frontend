// src/app/database/layout.tsx
import AppHeader from "@/components/app-header";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Database Management | NASA Space Biology Explorer",
    description: "Manage the NASA space biology papers database and monitor system status.",
};

export default function DatabaseLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen w-screen flex-col bg-background">
            <AppHeader />
            <main className="flex-1">{children}</main>
        </div>
    );
}
