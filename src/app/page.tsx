// src/app/page.tsx
"use client";
import AppHeader from "@/components/app-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { DatabaseStats, DatabaseStatus } from "@/lib/api-client";
import { apiClient } from "@/lib/api-client";
import { Activity, ArrowRight, Database, FileText, Search, Zap } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Home() {
    const [databaseStatus, setDatabaseStatus] = useState<DatabaseStatus | null>(null);
    const [databaseStats, setDatabaseStats] = useState<DatabaseStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [systemHealth, setSystemHealth] = useState(false);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            try {
                const [healthResult, statusResult, statsResult] = await Promise.allSettled([
                    apiClient.healthCheck(),
                    apiClient.getDatabaseStatus(),
                    apiClient.getDatabaseStats(),
                ]);

                if (healthResult.status === "fulfilled") {
                    setSystemHealth(healthResult.value.status === "healthy");
                }
                if (statusResult.status === "fulfilled") {
                    setDatabaseStatus(statusResult.value);
                }
                if (statsResult.status === "fulfilled") {
                    setDatabaseStats(statsResult.value);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex min-h-screen flex-col bg-background">
                <AppHeader />
                <main className="flex-1 py-8 md:py-12">
                    <div className="space-y-8 container mx-auto px-4 md:px-6">
                        <div className="space-y-4 text-center">
                            <Skeleton className="h-12 w-1/2 mx-auto" />
                            <Skeleton className="h-6 w-3/4 mx-auto" />
                        </div>
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {[...Array(6)].map((_, i) => (
                                <Skeleton key={i} className="h-48" />
                            ))}
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen w-screen flex-col bg-background">
            <AppHeader />
            <main className="flex-1 py-8 md:py-12">
                <div className="container mx-auto px-4 md:px-6">
                    {/* Hero Section */}
                    <div className="text-center mb-16">
                        <h1 className="font-headline text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl mb-6">
                            NASA Space Biology
                            <span className="bg-gradient-to-r from-black to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
                                {" "}
                                Knowledge Engine
                            </span>
                        </h1>
                        <p className="mx-auto max-w-[700px] text-gray-600 dark:text-gray-400 text-lg md:text-xl mb-8">
                            AI-powered search and analysis of NASA space biology research papers with advanced
                            embedding-based retrieval and on-demand content extraction.
                        </p>
                        <div className="flex gap-4 justify-center">
                            <Link href="/search">
                                <Button
                                    size="lg"
                                    className="gap-2 bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200"
                                >
                                    <Search className="h-5 w-5" />
                                    Start Searching
                                </Button>
                            </Link>
                            <Link href="/database">
                                <Button variant="outline" size="lg" className="gap-2">
                                    <Database className="h-5 w-5" />
                                    Manage Database
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* System Status */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">System Status</CardTitle>
                                <Activity className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    <Badge variant={systemHealth ? "default" : "destructive"}>
                                        {systemHealth ? "Healthy" : "Offline"}
                                    </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground">API connection status</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Vector Database</CardTitle>
                                <Database className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{databaseStatus?.total_papers || 0}</div>
                                <p className="text-xs text-muted-foreground">Papers available for search</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Papers</CardTitle>
                                <FileText className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{databaseStats?.total_papers || 0}</div>
                                <p className="text-xs text-muted-foreground">
                                    {databaseStats?.loaded_papers || 0} loaded, {databaseStats?.unloaded_papers || 0}{" "}
                                    pending
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Feature Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                        <Card className="group hover:shadow-xl transition-all border-gray-200 dark:border-gray-800">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="p-3 bg-black dark:bg-white rounded-lg group-hover:scale-110 transition-transform">
                                        <Search className="h-8 w-8 text-white dark:text-black" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                            Intelligent Search
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-400">
                                            Vector-based semantic search with AI-powered answers
                                        </p>
                                    </div>
                                </div>
                                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
                                    <li>• Semantic similarity search through research papers</li>
                                    <li>• AI-generated answers with source citations</li>
                                    <li>• Multiple search methods (similarity, MMR)</li>
                                    <li>• Keyword filtering and advanced options</li>
                                </ul>
                                <Link href="/search">
                                    <Button className="gap-2 bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200">
                                        Try Search <ArrowRight className="h-4 w-4" />
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>

                        <Card className="group hover:shadow-xl transition-all border-gray-200 dark:border-gray-800">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="p-3 bg-black dark:bg-white rounded-lg group-hover:scale-110 transition-transform">
                                        <Zap className="h-8 w-8 text-white dark:text-black" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                            On-Demand Content
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-400">
                                            Real-time paper scraping with image extraction
                                        </p>
                                    </div>
                                </div>
                                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
                                    <li>• Scrape papers on-demand during search</li>
                                    <li>• Extract figures and images from papers</li>
                                    <li>• Automatic content chunking and embedding</li>
                                    <li>• Fresh content with every search</li>
                                </ul>
                                <Link href="/search">
                                    <Button
                                        variant="outline"
                                        className="gap-2 border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900"
                                    >
                                        Learn More <ArrowRight className="h-4 w-4" />
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Quick Stats */}
                    {databaseStats && (
                        <Card className="border-gray-200 dark:border-gray-800">
                            <CardContent className="p-6">
                                <h3 className="text-lg font-semibold mb-6 text-gray-900 dark:text-white">
                                    Database Overview
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="text-center p-4 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
                                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                            {databaseStats.total_papers}
                                        </div>
                                        <div className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider mt-1">
                                            Total Papers
                                        </div>
                                    </div>
                                    <div className="text-center p-4 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
                                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                            {databaseStats.loaded_papers}
                                        </div>
                                        <div className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider mt-1">
                                            Loaded Papers
                                        </div>
                                    </div>
                                    <div className="text-center p-4 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
                                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                            {databaseStats.unloaded_papers}
                                        </div>
                                        <div className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider mt-1">
                                            Pending Papers
                                        </div>
                                    </div>
                                    <div className="text-center p-4 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
                                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                            {databaseStats.total_chunks_created}
                                        </div>
                                        <div className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider mt-1">
                                            Total Chunks
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </main>
            <footer className="py-6 text-center text-sm text-muted-foreground">
                © {new Date().getFullYear()} NASA Space Biology Knowledge Engine. All rights reserved.
            </footer>
        </div>
    );
}
