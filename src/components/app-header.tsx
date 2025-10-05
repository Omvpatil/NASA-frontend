// src/components/app-header.tsx
import { Database, Rocket, Search } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";
import { SidebarTrigger } from "./ui/sidebar";

export default function AppHeader() {
    return (
        <header className="bg-background text-foreground shadow-sm sticky top-0 z-50 border-b">
            <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
                <div className="flex items-center gap-3">
                    <div className="md:hidden">
                        <SidebarTrigger />
                    </div>
                    <Link href="/" className="flex items-center gap-3">
                        <Rocket className="h-8 w-8 text-primary" />
                        <h1 className="font-headline text-2xl font-bold tracking-tight sm:text-3xl">
                            NASA Knowledge Engine
                        </h1>
                    </Link>
                </div>
                <nav className="hidden items-center gap-2 md:flex">
                    <Button variant="ghost" asChild>
                        <Link href="/">Home</Link>
                    </Button>
                    <Button variant="ghost" asChild>
                        <Link href="/search" className="flex items-center gap-2">
                            <Search className="h-4 w-4" />
                            Search Papers
                        </Link>
                    </Button>
                    <Button variant="ghost" asChild>
                        <Link href="/database" className="flex items-center gap-2">
                            <Database className="h-4 w-4" />
                            Database
                        </Link>
                    </Button>
                    <Button variant="ghost" asChild>
                        <Link href="/about">About</Link>
                    </Button>
                </nav>
            </div>
        </header>
    );
}
