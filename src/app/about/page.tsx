// src/app/about/page.tsx
"use client";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { DatabaseStats, Model } from "@/lib/api-client";
import { apiClient } from "@/lib/api-client";
import { Brain, Database, FileText, Image, Search, Zap } from "lucide-react";
import { useEffect, useState } from "react";

export default function AboutPage() {
    const [databaseStats, setDatabaseStats] = useState<DatabaseStats | null>(null);
    const [models, setModels] = useState<Model[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            try {
                const [statsResult, modelsResult] = await Promise.allSettled([
                    apiClient.getDatabaseStats(),
                    apiClient.listModels(),
                ]);

                if (statsResult.status === "fulfilled") {
                    setDatabaseStats(statsResult.value);
                }
                if (modelsResult.status === "fulfilled") {
                    setModels(modelsResult.value.models);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    const apiFeatures = [
        {
            name: "Semantic Search",
            icon: Search,
            description: "Vector-based search through research papers with AI-generated answers.",
        },
        {
            name: "On-Demand Scraping",
            icon: Zap,
            description: "Real-time paper content extraction with image support.",
        },
        { name: "Vector Database", icon: Database, description: "ChromaDB-powered semantic similarity search." },
        { name: "AI Models", icon: Brain, description: "Support for various Google Gemini AI models." },
        {
            name: "Database Management",
            icon: FileText,
            description: "Complete CRUD operations for papers and embeddings.",
        },
        {
            name: "Image Extraction",
            icon: Image,
            description: "Automatic extraction of figures and images from papers.",
        },
    ];

    const searchMethods = [
        { name: "Similarity Search", description: "Vector-based semantic similarity matching using embeddings." },
        { name: "MMR Search", description: "Maximum Marginal Relevance for diverse, non-redundant results." },
        { name: "Keyword Filtering", description: "Filter results by specific keywords found in paper titles." },
        { name: "Configurable Results", description: "Adjust number of results from 1-50 papers per search." },
    ];

    return (
        <div className="container mx-auto px-4 py-8 md:px-6 lg:py-12">
            <div className="space-y-4 text-center mb-12">
                <h1 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                    About NASA Space Biology Knowledge Engine
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                    An AI-powered search and analysis platform for NASA space biology research papers with advanced
                    vector-based retrieval and on-demand content extraction.
                </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>FastAPI Backend</CardTitle>
                        <CardDescription>
                            This application is powered by a FastAPI backend with vector database.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p>
                            This application connects to a FastAPI backend that provides comprehensive search and
                            database management capabilities. The backend uses ChromaDB for vector storage and
                            embedding-based search, with support for both pre-loaded and on-demand content extraction.
                        </p>
                        <p>
                            Papers are scraped from NASA's PubMed Central database, processed into chunks, and stored as
                            embeddings for semantic search. The system supports real-time content extraction with image
                            parsing and AI-powered answer generation.
                        </p>
                        <div className="flex items-center gap-4 rounded-lg border bg-muted p-4">
                            <div className="flex-1">
                                <p className="font-semibold">Database Status</p>
                                <p className="text-sm text-muted-foreground">
                                    Papers currently available in the database.
                                </p>
                            </div>
                            {loading ? (
                                <Skeleton className="h-10 w-24" />
                            ) : (
                                <Badge variant="secondary" className="text-2xl font-bold">
                                    {databaseStats?.total_papers || 0}
                                </Badge>
                            )}
                        </div>
                        {databaseStats && (
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="text-center p-3 border border-gray-200 dark:border-gray-800 rounded bg-gray-50 dark:bg-gray-900/50">
                                    <div className="font-semibold text-xl text-gray-900 dark:text-white">
                                        {databaseStats.loaded_papers}
                                    </div>
                                    <div className="text-gray-600 dark:text-gray-400 text-xs uppercase tracking-wider mt-1">
                                        Loaded
                                    </div>
                                </div>
                                <div className="text-center p-3 border border-gray-200 dark:border-gray-800 rounded bg-gray-50 dark:bg-gray-900/50">
                                    <div className="font-semibold text-xl text-gray-900 dark:text-white">
                                        {databaseStats.unloaded_papers}
                                    </div>
                                    <div className="text-gray-600 dark:text-gray-400 text-xs uppercase tracking-wider mt-1">
                                        Pending
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>AI Models</CardTitle>
                        <CardDescription>Available language models for answer generation.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {loading ? (
                            <div className="space-y-2">
                                {[...Array(4)].map((_, i) => (
                                    <Skeleton key={i} className="h-12 w-full" />
                                ))}
                            </div>
                        ) : (
                            <ul className="space-y-3">
                                {models.map(model => (
                                    <li key={model.name} className="border rounded-lg p-3">
                                        <div className="font-medium text-sm">{model.name}</div>
                                        <div className="text-xs text-muted-foreground">{model.description}</div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* API Features Section */}
            <div className="mt-12">
                <h2 className="text-2xl font-bold text-center mb-8">Platform Features</h2>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {apiFeatures.map(feature => (
                        <Card
                            key={feature.name}
                            className="group hover:shadow-md transition-all border-gray-200 dark:border-gray-800"
                        >
                            <CardContent className="p-5">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2.5 bg-black dark:bg-white rounded-lg group-hover:scale-110 transition-transform">
                                        <feature.icon className="h-5 w-5 text-white dark:text-black" />
                                    </div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white">{feature.name}</h3>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{feature.description}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Search Methods Section */}
            <div className="mt-12">
                <h2 className="text-2xl font-bold text-center mb-8">Search Methods</h2>
                <div className="grid gap-6 md:grid-cols-2">
                    {searchMethods.map(method => (
                        <Card key={method.name} className="p-4">
                            <h3 className="font-semibold mb-2">{method.name}</h3>
                            <p className="text-sm text-muted-foreground">{method.description}</p>
                        </Card>
                    ))}
                </div>
            </div>

            {/* API Endpoints Section */}
            <div className="mt-12">
                <Card>
                    <CardHeader>
                        <CardTitle>Available API Endpoints</CardTitle>
                        <CardDescription>Key endpoints provided by the FastAPI backend</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-3">
                                <h4 className="font-semibold text-sm uppercase tracking-wider text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-800 pb-2">
                                    Search Operations
                                </h4>
                                <ul className="space-y-2 text-sm">
                                    <li className="flex items-start gap-2">
                                        <code className="bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded text-xs font-mono border border-gray-200 dark:border-gray-800 shrink-0">
                                            POST /search
                                        </code>
                                        <span className="text-gray-600 dark:text-gray-400">
                                            Semantic search with optional AI answers
                                        </span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <code className="bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded text-xs font-mono border border-gray-200 dark:border-gray-800 shrink-0">
                                            POST /search/on-demand
                                        </code>
                                        <span className="text-gray-600 dark:text-gray-400">
                                            Real-time scraping with images
                                        </span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <code className="bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded text-xs font-mono border border-gray-200 dark:border-gray-800 shrink-0">
                                            GET /papers
                                        </code>
                                        <span className="text-gray-600 dark:text-gray-400">List loaded papers</span>
                                    </li>
                                </ul>
                            </div>
                            <div className="space-y-3">
                                <h4 className="font-semibold text-sm uppercase tracking-wider text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-800 pb-2">
                                    Database Management
                                </h4>
                                <ul className="space-y-2 text-sm">
                                    <li className="flex items-start gap-2">
                                        <code className="bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded text-xs font-mono border border-gray-200 dark:border-gray-800 shrink-0">
                                            POST /database/load-csv
                                        </code>
                                        <span className="text-gray-600 dark:text-gray-400">Load papers metadata</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <code className="bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded text-xs font-mono border border-gray-200 dark:border-gray-800 shrink-0">
                                            POST /load-papers
                                        </code>
                                        <span className="text-gray-600 dark:text-gray-400">
                                            Scrape and embed papers
                                        </span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <code className="bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded text-xs font-mono border border-gray-200 dark:border-gray-800 shrink-0">
                                            GET /database/stats
                                        </code>
                                        <span className="text-gray-600 dark:text-gray-400">Database statistics</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <code className="bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded text-xs font-mono border border-gray-200 dark:border-gray-800 shrink-0">
                                            POST /reset-database
                                        </code>
                                        <span className="text-gray-600 dark:text-gray-400">Reset all data</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
