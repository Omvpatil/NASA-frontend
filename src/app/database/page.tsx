// src/app/database/page.tsx
"use client";
import { loadCSVToDatabaseAction, loadPapersAction, resetDatabaseAction } from "@/app/actions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import type { DatabaseStats, DatabaseStatus, Paper } from "@/lib/api-client";
import { apiClient } from "@/lib/api-client";
import {
    Activity,
    AlertCircle,
    CheckCircle,
    Database,
    Download,
    FileText,
    HardDrive,
    Loader2,
    RefreshCw,
    Upload,
} from "lucide-react";
import { useEffect, useState, useTransition } from "react";

export default function DatabasePage() {
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();
    const [databaseStatus, setDatabaseStatus] = useState<DatabaseStatus | null>(null);
    const [databaseStats, setDatabaseStats] = useState<DatabaseStats | null>(null);
    const [loadedPapers, setLoadedPapers] = useState<Paper[]>([]);
    const [unloadedPapers, setUnloadedPapers] = useState<Paper[]>([]);
    const [numPapersToLoad, setNumPapersToLoad] = useState(10);
    const [loading, setLoading] = useState(true);
    const [operationInProgress, setOperationInProgress] = useState<string | null>(null);

    const fetchDatabaseInfo = async () => {
        try {
            setLoading(true);
            const [statusResult, statsResult, loadedResult, unloadedResult] = await Promise.allSettled([
                apiClient.getDatabaseStatus(),
                apiClient.getDatabaseStats(),
                apiClient.getLoadedPapers(10),
                apiClient.getUnloadedPapers(10),
            ]);

            if (statusResult.status === "fulfilled") {
                setDatabaseStatus(statusResult.value);
            }
            if (statsResult.status === "fulfilled") {
                setDatabaseStats(statsResult.value);
            }
            if (loadedResult.status === "fulfilled") {
                setLoadedPapers(loadedResult.value.papers);
            }
            if (unloadedResult.status === "fulfilled") {
                setUnloadedPapers(unloadedResult.value.papers);
            }
        } catch (error) {
            console.error("Error fetching database info:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDatabaseInfo();
    }, []);

    const handleLoadCSV = () => {
        setOperationInProgress("Loading CSV...");
        startTransition(async () => {
            const { result, error } = await loadCSVToDatabaseAction();
            setOperationInProgress(null);

            if (error) {
                toast({
                    title: "Error Loading CSV",
                    description: error,
                    variant: "destructive",
                });
            } else {
                toast({
                    title: "CSV Loaded Successfully",
                    description: `Added ${result?.stats?.new_papers_added || 0} new papers to database.`,
                });
                fetchDatabaseInfo();
            }
        });
    };

    const handleLoadPapers = () => {
        setOperationInProgress(`Loading ${numPapersToLoad} papers...`);
        startTransition(async () => {
            const { result, error } = await loadPapersAction(numPapersToLoad);
            setOperationInProgress(null);

            if (error) {
                toast({
                    title: "Error Loading Papers",
                    description: error,
                    variant: "destructive",
                });
            } else {
                toast({
                    title: "Papers Loaded Successfully",
                    description: `Loaded ${result?.papers_loaded || 0} papers and created ${
                        result?.chunks_created || 0
                    } chunks.`,
                });
                fetchDatabaseInfo();
            }
        });
    };

    const handleResetDatabase = () => {
        if (!confirm("Are you sure you want to reset the entire database? This action cannot be undone.")) {
            return;
        }

        setOperationInProgress("Resetting database...");
        startTransition(async () => {
            const { result, error } = await resetDatabaseAction();
            setOperationInProgress(null);

            if (error) {
                toast({
                    title: "Error Resetting Database",
                    description: error,
                    variant: "destructive",
                });
            } else {
                toast({
                    title: "Database Reset Successfully",
                    description: "All data has been cleared from the database.",
                });
                fetchDatabaseInfo();
            }
        });
    };

    const loadingProgress = databaseStats ? (databaseStats.loaded_papers / databaseStats.total_papers) * 100 : 0;

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                    <p>Loading database information...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            <div className="text-center mb-8">
                <h1 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4">
                    Database Management
                </h1>
                <p className="text-muted-foreground md:text-lg max-w-2xl mx-auto">
                    Manage the NASA space biology papers database, load new content, and monitor system status.
                </p>
            </div>

            {operationInProgress && (
                <Alert className="mb-6">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <AlertDescription>{operationInProgress}</AlertDescription>
                </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {/* Database Status */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Vector Database</CardTitle>
                        <Database className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {databaseStatus ? (
                                <Badge variant={databaseStatus.status === "loaded" ? "default" : "secondary"}>
                                    {databaseStatus.status}
                                </Badge>
                            ) : (
                                <Badge variant="destructive">Not Available</Badge>
                            )}
                        </div>
                        {databaseStatus && (
                            <div className="text-xs text-muted-foreground mt-2">
                                <p>
                                    {databaseStatus.total_chunks} chunks from {databaseStatus.total_papers} papers
                                </p>
                                <p className="truncate">{databaseStatus.collection_name}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* SQLite Database Stats */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">SQLite Database</CardTitle>
                        <HardDrive className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{databaseStats?.total_papers || 0}</div>
                        <p className="text-xs text-muted-foreground">Total papers in database</p>
                        {databaseStats && (
                            <div className="mt-2">
                                <div className="flex justify-between text-xs mb-1">
                                    <span>Loaded: {databaseStats.loaded_papers}</span>
                                    <span>Unloaded: {databaseStats.unloaded_papers}</span>
                                </div>
                                <Progress value={loadingProgress} className="h-2" />
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* System Health */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">System Health</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {databaseStatus ? (
                                <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                                    <CheckCircle className="h-5 w-5 text-gray-900 dark:text-white" />
                                    Healthy
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                                    <AlertCircle className="h-5 w-5 text-gray-900 dark:text-white" />
                                    Issues
                                </div>
                            )}
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                            {databaseStats?.total_chunks_created || 0} total chunks created
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="operations" className="space-y-6">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="operations">Operations</TabsTrigger>
                    <TabsTrigger value="loaded">Loaded Papers</TabsTrigger>
                    <TabsTrigger value="unloaded">Unloaded Papers</TabsTrigger>
                </TabsList>

                <TabsContent value="operations" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Load CSV */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Upload className="h-5 w-5" />
                                    Load CSV to Database
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Load the NASA papers CSV file into the SQLite database. This is the first step
                                    before loading full papers.
                                </p>
                                <Button onClick={handleLoadCSV} disabled={isPending} className="w-full">
                                    {isPending ? (
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    ) : (
                                        <Upload className="h-4 w-4 mr-2" />
                                    )}
                                    Load CSV
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Load Papers */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Download className="h-5 w-5" />
                                    Load Full Papers
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Scrape full paper content and create embeddings for search.
                                </p>
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-sm font-medium">Number of papers to load:</label>
                                        <Input
                                            type="number"
                                            min="1"
                                            max="100"
                                            value={numPapersToLoad}
                                            onChange={e => setNumPapersToLoad(parseInt(e.target.value) || 10)}
                                            className="mt-1"
                                        />
                                    </div>
                                    <Button
                                        onClick={handleLoadPapers}
                                        disabled={isPending || !databaseStats?.unloaded_papers}
                                        className="w-full"
                                    >
                                        {isPending ? (
                                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                        ) : (
                                            <Download className="h-4 w-4 mr-2" />
                                        )}
                                        Load Papers
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Reset Database */}
                        <Card className="md:col-span-2 border-gray-300 dark:border-gray-700">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                                    <RefreshCw className="h-5 w-5" />
                                    Reset Database
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Alert className="mb-4 border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                                    <AlertCircle className="h-4 w-4 text-gray-900 dark:text-white" />
                                    <AlertDescription className="text-gray-700 dark:text-gray-300">
                                        This will permanently delete all data from both the vector database and SQLite
                                        database. This action cannot be undone.
                                    </AlertDescription>
                                </Alert>
                                <Button
                                    onClick={handleResetDatabase}
                                    disabled={isPending}
                                    variant="destructive"
                                    className="w-full"
                                >
                                    {isPending ? (
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    ) : (
                                        <RefreshCw className="h-4 w-4 mr-2" />
                                    )}
                                    Reset Database
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="loaded" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                                <CheckCircle className="h-5 w-5 text-gray-900 dark:text-white" />
                                Loaded Papers ({loadedPapers.length})
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {loadedPapers.length === 0 ? (
                                <p className="text-gray-600 dark:text-gray-400 text-center py-4">
                                    No papers loaded yet.
                                </p>
                            ) : (
                                <div className="space-y-3">
                                    {loadedPapers.map(paper => (
                                        <div key={paper.id} className="border rounded-lg p-3">
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex-1">
                                                    <h4 className="font-medium text-sm leading-tight">{paper.title}</h4>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <Badge variant="outline">{paper.pmcid}</Badge>
                                                        <Badge variant="secondary">{paper.chunksCreated} chunks</Badge>
                                                    </div>
                                                    {paper.loadedAt && (
                                                        <p className="text-xs text-muted-foreground mt-1">
                                                            Loaded: {new Date(paper.loadedAt).toLocaleDateString()}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="unloaded" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5 text-muted-foreground" />
                                Unloaded Papers ({unloadedPapers.length})
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {unloadedPapers.length === 0 ? (
                                <p className="text-muted-foreground text-center py-4">All papers have been loaded.</p>
                            ) : (
                                <div className="space-y-3">
                                    {unloadedPapers.map(paper => (
                                        <div key={paper.id} className="border rounded-lg p-3">
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex-1">
                                                    <h4 className="font-medium text-sm leading-tight">{paper.title}</h4>
                                                    <Badge variant="outline" className="mt-1">
                                                        {paper.pmcid}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
