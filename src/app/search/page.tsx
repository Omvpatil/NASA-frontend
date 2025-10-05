// src/app/search/page.tsx
"use client";
import { getWorkflowAction, searchPapersAction } from "@/app/actions";
import MarkdownRenderer from "@/components/markdown-renderer";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import type { SearchResponse, WorkflowResponse } from "@/lib/api-client";
import {
    Bot,
    ExternalLink,
    FileText,
    Image as ImageIcon,
    Loader2,
    Maximize2,
    Minimize2,
    Moon,
    Network,
    Search,
    Sparkles,
    Sun,
    User,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import ReactFlow, {
    addEdge,
    Background,
    Connection,
    Controls,
    Edge,
    MiniMap,
    Node,
    useEdgesState,
    useNodesState,
} from "reactflow";
import "reactflow/dist/style.css";
import "./workflow-styles-new.css";

type SearchMessage = {
    role: "user" | "assistant";
    content: string;
    searchResult?: SearchResponse;
};

export default function SearchPage() {
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();
    const [messages, setMessages] = useState<SearchMessage[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [numResults, setNumResults] = useState(10);
    const [useLLM, setUseLLM] = useState(true);
    const [modelName, setModelName] = useState("gemini-2.5-flash");
    const [googleApiKey, setGoogleApiKey] = useState("");
    const [workflowData, setWorkflowData] = useState<WorkflowResponse | null>(null);
    const [isLoadingWorkflow, setIsLoadingWorkflow] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [workflowTheme, setWorkflowTheme] = useState<"light" | "dark">("light");
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    const onConnect = useCallback((params: Connection) => setEdges(eds => addEdge(params, eds)), [setEdges]);

    // Update node and edge classes when theme changes
    useEffect(() => {
        if (nodes.length > 0) {
            const updatedNodes = nodes.map(node => ({
                ...node,
                className: `${node.className?.replace(" dark", "")} ${workflowTheme === "dark" ? "dark" : ""}`,
            }));
            setNodes(updatedNodes);
        }
        if (edges.length > 0) {
            const updatedEdges = edges.map(edge => ({
                ...edge,
                className: `${edge.className?.replace(" dark", "")} ${workflowTheme === "dark" ? "dark" : ""}`,
            }));
            setEdges(updatedEdges);
        }
    }, [workflowTheme]);

    useEffect(() => {
        const scrollArea = scrollAreaRef.current?.querySelector("div[data-radix-scroll-area-viewport]");
        if (scrollArea) {
            scrollArea.scrollTo({
                top: scrollArea.scrollHeight,
                behavior: "smooth",
            });
        }
    }, [messages, isPending]);

    const handleSearch = () => {
        if (!inputValue.trim()) return;

        const newMessages: SearchMessage[] = [...messages, { role: "user", content: inputValue }];
        setMessages(newMessages);
        const query = inputValue;
        setInputValue("");

        startTransition(async () => {
            try {
                const { result, error } = await searchPapersAction(
                    query,
                    numResults,
                    useLLM,
                    googleApiKey || undefined,
                    modelName
                );

                if (error) {
                    toast({
                        title: "Search Error",
                        description: error,
                        variant: "destructive",
                    });
                    return;
                }

                if (result) {
                    setMessages(prev => [
                        ...prev,
                        {
                            role: "assistant",
                            content: result.answer || "Search completed with document results.",
                            searchResult: result,
                        },
                    ]);
                }
            } catch (error) {
                toast({
                    title: "Search Error",
                    description: "An unexpected error occurred while searching.",
                    variant: "destructive",
                });
            }
        });

        // Load workflow in background
        loadWorkflow(query);
    };

    const loadWorkflow = async (query: string) => {
        setIsLoadingWorkflow(true);
        try {
            const { result, error } = await getWorkflowAction(query, numResults, googleApiKey || undefined, modelName);

            if (error) {
                console.error("Workflow error:", error);
                return;
            }

            if (result) {
                setWorkflowData(result);

                // Add className to nodes based on their label prefix
                const nodesWithClass = result.nodes.map((node: any) => {
                    let className = "";
                    const label = node.data?.label || "";

                    if (label.startsWith("Paper:")) {
                        className = "paper-node";
                    } else if (label.startsWith("Author:")) {
                        className = "author-node";
                    } else if (label.startsWith("Topic:")) {
                        className = "topic-node";
                    } else if (label.startsWith("Method:")) {
                        className = "method-node";
                    } else if (label.startsWith("Results:")) {
                        className = "results-node";
                    } else if (label.startsWith("Citation:")) {
                        className = "citation-node";
                    } else {
                        className = "default-node";
                    }

                    className += workflowTheme === "dark" ? " dark" : "";
                    return { ...node, className };
                });

                // Add className to edges based on their label
                const edgesWithClass = result.edges.map((edge: any) => {
                    let className = "";
                    const label = edge.label?.toLowerCase() || "";

                    if (label.includes("authored by")) {
                        className = "author-edge";
                    } else if (label.includes("focuses on")) {
                        className = "topic-edge";
                    } else if (label.includes("uses")) {
                        className = "method-edge";
                    } else if (label.includes("finds")) {
                        className = "results-edge";
                    } else if (label.includes("cites")) {
                        className = "citation-edge";
                    } else {
                        className = "default-edge";
                    }

                    className += workflowTheme === "dark" ? " dark" : "";
                    return { ...edge, className };
                });

                setNodes(nodesWithClass as Node[]);
                setEdges(edgesWithClass as Edge[]);
            }
        } catch (error) {
            console.error("Failed to load workflow:", error);
        } finally {
            setIsLoadingWorkflow(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSearch();
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-black dark:to-gray-950">
            {/* Header Section */}
            <div className="border-b border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-black/50 backdrop-blur-sm">
                <div className="container mx-auto px-6 py-8">
                    <div className="max-w-3xl">
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3 bg-gradient-to-r from-black to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
                            NASA Research Intelligence
                        </h1>
                        <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                            Advanced semantic search powered by AI • Automatic content extraction • Visual research
                            mapping
                        </p>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-6 py-8 w-screen">
                <div className="flex gap-8">
                    {/* Search Settings Sidebar */}
                    <div className="w-2/5">
                        <Card className="sticky top-24 left-0 border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-black">
                            <CardHeader className="pb-4 border-b border-gray-100 dark:border-gray-900">
                                <CardTitle className="text-sm font-semibold uppercase tracking-wider text-gray-900 dark:text-white flex items-center gap-2">
                                    <div className="h-1 w-1 rounded-full bg-black dark:bg-white"></div>
                                    Configuration
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6 pt-6">
                                <div className="space-y-2">
                                    <Label
                                        htmlFor="num-results"
                                        className="text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide"
                                    >
                                        Results
                                    </Label>
                                    <Select
                                        value={numResults.toString()}
                                        onValueChange={value => setNumResults(parseInt(value))}
                                    >
                                        <SelectTrigger className="h-11 border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="border-gray-200 dark:border-gray-800">
                                            <SelectItem value="5">5 Papers</SelectItem>
                                            <SelectItem value="10">10 Papers</SelectItem>
                                            <SelectItem value="15">15 Papers</SelectItem>
                                            <SelectItem value="20">20 Papers</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-3 pt-3 border-t border-gray-100 dark:border-gray-900">
                                    <div className="flex items-center justify-between">
                                        <Label
                                            htmlFor="use-llm"
                                            className="text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide cursor-pointer"
                                        >
                                            AI Analysis
                                        </Label>
                                        <Checkbox
                                            id="use-llm"
                                            checked={useLLM}
                                            onCheckedChange={checked => setUseLLM(!!checked)}
                                            className="border-gray-400 dark:border-gray-600 data-[state=checked]:bg-black dark:data-[state=checked]:bg-white data-[state=checked]:border-black dark:data-[state=checked]:border-white"
                                        />
                                    </div>

                                    {useLLM && (
                                        <div className="space-y-4 animate-in slide-in-from-top-2 duration-200">
                                            <div className="space-y-2">
                                                <Label
                                                    htmlFor="model"
                                                    className="text-xs font-medium text-gray-700 dark:text-gray-300"
                                                >
                                                    Model Selection
                                                </Label>
                                                <Select value={modelName} onValueChange={value => setModelName(value)}>
                                                    <SelectTrigger className="h-10 border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent className="border-gray-200 dark:border-gray-800">
                                                        <SelectItem value="gemini-2.5-flash">
                                                            <div className="flex items-center gap-2">
                                                                <Sparkles className="h-3.5 w-3.5" />
                                                                <span>Gemini 2.5 Flash</span>
                                                            </div>
                                                        </SelectItem>
                                                        <SelectItem value="gemini-2.5-pro">Gemini 2.5 Pro</SelectItem>
                                                        <SelectItem value="gemini-1.5-pro">Gemini 1.5 Pro</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="space-y-2">
                                                <Label
                                                    htmlFor="api-key"
                                                    className="text-xs font-medium text-gray-700 dark:text-gray-300"
                                                >
                                                    API Key
                                                </Label>
                                                <Input
                                                    id="api-key"
                                                    type="password"
                                                    placeholder="Google API key..."
                                                    value={googleApiKey}
                                                    onChange={e => setGoogleApiKey(e.target.value)}
                                                    className="h-10 border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 placeholder:text-gray-400 dark:placeholder:text-gray-600"
                                                />
                                                <p className="text-[10px] text-gray-500 dark:text-gray-500 mt-1.5">
                                                    Required for AI-powered responses
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Main Content with Tabs */}
                    {/* Main Content Area */}
                    <div className="lg:col-span-4 w-full">
                        <Card className="border-gray-200 dark:border-gray-800 shadow-lg bg-white dark:bg-black w-full">
                            <CardHeader className="pb-4 border-b border-gray-100 dark:border-gray-900">
                                <CardTitle className="text-sm font-semibold uppercase tracking-wider text-gray-900 dark:text-white flex items-center gap-2">
                                    <Search className="h-4 w-4" />
                                    Research Explorer
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex-1 flex flex-col p-0">
                                <Tabs defaultValue="chat" className="flex-1 flex flex-col">
                                    <TabsList className="w-full justify-start border-b border-gray-100 dark:border-gray-900 rounded-none bg-transparent p-0 h-auto">
                                        <TabsTrigger
                                            value="chat"
                                            className="rounded-none border-b-2 border-transparent data-[state=active]:border-black dark:data-[state=active]:border-white data-[state=active]:bg-transparent data-[state=active]:shadow-none px-6 py-3 text-sm font-medium"
                                        >
                                            <Bot className="h-4 w-4 mr-2" />
                                            Analysis
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="images"
                                            className="rounded-none border-b-2 border-transparent data-[state=active]:border-black dark:data-[state=active]:border-white data-[state=active]:bg-transparent data-[state=active]:shadow-none px-6 py-3 text-sm font-medium"
                                        >
                                            <ImageIcon className="h-4 w-4 mr-2" />
                                            Visuals
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="workflow"
                                            className="rounded-none border-b-2 border-transparent data-[state=active]:border-black dark:data-[state=active]:border-white data-[state=active]:bg-transparent data-[state=active]:shadow-none px-6 py-3 text-sm font-medium"
                                        >
                                            <Network className="h-4 w-4 mr-2" />
                                            Network
                                        </TabsTrigger>
                                    </TabsList>

                                    {/* Chat Tab */}
                                    <TabsContent value="chat" className="flex-1 flex flex-col mt-0 p-6">
                                        <ScrollArea className="flex-1 mb-6 pr-4" ref={scrollAreaRef}>
                                            <div className="space-y-6">
                                                {messages.length === 0 && (
                                                    <div className="flex flex-col items-center justify-center py-20">
                                                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-900 mb-6">
                                                            <Search className="h-8 w-8 text-gray-400 dark:text-gray-600" />
                                                        </div>
                                                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                                            Begin Your Research
                                                        </h3>
                                                        <p className="text-sm text-gray-500 dark:text-gray-500 max-w-sm mx-auto">
                                                            Enter a query to explore NASA space biology research papers
                                                        </p>
                                                        <p className="text-xs text-gray-400 dark:text-gray-600 mt-4 font-mono">
                                                            → "Effects of microgravity on bone density"
                                                        </p>
                                                    </div>
                                                )}

                                                {messages.map((message, index) => (
                                                    <div
                                                        key={index}
                                                        className="flex gap-4 animate-in  fade-in slide-in-from-bottom-3 duration-300"
                                                    >
                                                        <Avatar className="h-9 w-9 flex-shrink-0 border border-gray-200 dark:border-gray-800">
                                                            <AvatarFallback
                                                                className={
                                                                    message.role === "user"
                                                                        ? "bg-black dark:bg-white"
                                                                        : "bg-gray-900 dark:bg-gray-100"
                                                                }
                                                            >
                                                                {message.role === "user" ? (
                                                                    <User className="h-4 w-4 text-white dark:text-black" />
                                                                ) : (
                                                                    <Bot className="h-4 w-4 text-white dark:text-black" />
                                                                )}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className="flex-1 space-y-3 min-w-0">
                                                            {message.role === "user" ? (
                                                                <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
                                                                    <p className="text-sm text-gray-900 dark:text-gray-100 leading-relaxed">
                                                                        {message.content}
                                                                    </p>
                                                                </div>
                                                            ) : (
                                                                <div className="space-y-4">
                                                                    {message.content && (
                                                                        <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-black shadow-sm">
                                                                            <CardContent className="pt-5 pb-4">
                                                                                <div className="flex items-start gap-3">
                                                                                    <Sparkles className="h-4 w-4 text-gray-900 dark:text-gray-100 mt-0.5 flex-shrink-0" />
                                                                                    <div className="flex-1 prose prose-sm dark:prose-invert prose-gray max-w-none">
                                                                                        <MarkdownRenderer
                                                                                            content={message.content}
                                                                                        />
                                                                                    </div>
                                                                                </div>
                                                                            </CardContent>
                                                                        </Card>
                                                                    )}

                                                                    {message.searchResult && (
                                                                        <div className="mt-4 space-y-4">
                                                                            {/* Search statistics */}
                                                                            {"papers_newly_scraped" in
                                                                                message.searchResult && (
                                                                                <div className="flex gap-2 text-sm flex-wrap">
                                                                                    <Badge
                                                                                        variant="outline"
                                                                                        className="border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400"
                                                                                    >
                                                                                        {
                                                                                            message.searchResult
                                                                                                .papers_newly_scraped
                                                                                        }{" "}
                                                                                        papers newly scraped
                                                                                    </Badge>
                                                                                    <Badge
                                                                                        variant="outline"
                                                                                        className="border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400"
                                                                                    >
                                                                                        {
                                                                                            message.searchResult
                                                                                                .papers_already_loaded
                                                                                        }{" "}
                                                                                        papers already loaded
                                                                                    </Badge>
                                                                                    {"images_found" in
                                                                                        message.searchResult &&
                                                                                        message.searchResult
                                                                                            .images_found.length >
                                                                                            0 && (
                                                                                            <Badge
                                                                                                variant="outline"
                                                                                                className="border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400"
                                                                                            >
                                                                                                <ImageIcon className="h-3 w-3 mr-1" />
                                                                                                {message.searchResult.images_found.reduce(
                                                                                                    (acc, img) =>
                                                                                                        acc +
                                                                                                        img.images
                                                                                                            .length,
                                                                                                    0
                                                                                                )}{" "}
                                                                                                images found
                                                                                            </Badge>
                                                                                        )}
                                                                                </div>
                                                                            )}

                                                                            {/* Source Documents */}
                                                                            <div className="space-y-2">
                                                                                <div className="flex items-center gap-2 pt-2">
                                                                                    <FileText className="h-3.5 w-3.5 text-gray-500 dark:text-gray-500" />
                                                                                    <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                                                                                        Source Papers (
                                                                                        {
                                                                                            message.searchResult
                                                                                                .source_documents.length
                                                                                        }
                                                                                        )
                                                                                    </h4>
                                                                                </div>
                                                                                <div className="grid gap-2">
                                                                                    {message.searchResult.source_documents.map(
                                                                                        (doc, docIndex) => (
                                                                                            <Card
                                                                                                key={docIndex}
                                                                                                className="group hover:shadow-md transition-all border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50"
                                                                                            >
                                                                                                <CardContent className="p-4">
                                                                                                    <div className="space-y-3">
                                                                                                        <div className="flex items-start justify-between gap-3">
                                                                                                            <h5 className="font-medium text-sm leading-snug flex-1 text-gray-900 dark:text-white group-hover:text-black dark:group-hover:text-white transition-colors">
                                                                                                                {
                                                                                                                    doc
                                                                                                                        .metadata
                                                                                                                        .title
                                                                                                                }
                                                                                                            </h5>
                                                                                                            <Badge
                                                                                                                variant="outline"
                                                                                                                className="text-xs font-mono shrink-0 border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400"
                                                                                                            >
                                                                                                                {
                                                                                                                    doc
                                                                                                                        .metadata
                                                                                                                        .pmcid
                                                                                                                }
                                                                                                            </Badge>
                                                                                                        </div>
                                                                                                        <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
                                                                                                            {
                                                                                                                doc.page_content
                                                                                                            }
                                                                                                        </p>
                                                                                                        <div className="flex items-center justify-between pt-1">
                                                                                                            <a
                                                                                                                href={
                                                                                                                    doc
                                                                                                                        .metadata
                                                                                                                        .source
                                                                                                                }
                                                                                                                target="_blank"
                                                                                                                rel="noopener noreferrer"
                                                                                                                className="text-xs text-gray-900 dark:text-white hover:text-black dark:hover:text-white flex items-center gap-1.5 font-medium group/link"
                                                                                                            >
                                                                                                                View
                                                                                                                Paper{" "}
                                                                                                                <ExternalLink className="h-3 w-3 group-hover/link:translate-x-0.5 transition-transform" />
                                                                                                            </a>
                                                                                                            {doc
                                                                                                                .metadata
                                                                                                                .image_urls &&
                                                                                                                doc
                                                                                                                    .metadata
                                                                                                                    .image_urls
                                                                                                                    .length >
                                                                                                                    0 && (
                                                                                                                    <Badge
                                                                                                                        variant="outline"
                                                                                                                        className="text-xs border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400"
                                                                                                                    >
                                                                                                                        <ImageIcon className="h-3 w-3 mr-1" />
                                                                                                                        {
                                                                                                                            doc
                                                                                                                                .metadata
                                                                                                                                .image_urls
                                                                                                                                .length
                                                                                                                        }{" "}
                                                                                                                        images
                                                                                                                    </Badge>
                                                                                                                )}
                                                                                                        </div>
                                                                                                        {/* Show images if available */}
                                                                                                        {doc.metadata
                                                                                                            .image_urls &&
                                                                                                            doc.metadata
                                                                                                                .image_urls
                                                                                                                .length >
                                                                                                                0 && (
                                                                                                                <div className="flex gap-2 flex-wrap pt-1">
                                                                                                                    {doc.metadata.image_urls
                                                                                                                        .slice(
                                                                                                                            0,
                                                                                                                            3
                                                                                                                        )
                                                                                                                        .map(
                                                                                                                            (
                                                                                                                                imgUrl,
                                                                                                                                imgIndex
                                                                                                                            ) => (
                                                                                                                                <img
                                                                                                                                    key={
                                                                                                                                        imgIndex
                                                                                                                                    }
                                                                                                                                    src={
                                                                                                                                        imgUrl
                                                                                                                                    }
                                                                                                                                    alt={`Figure from ${doc.metadata.title}`}
                                                                                                                                    className="w-20 h-20 object-cover rounded border border-gray-300 dark:border-gray-700 cursor-pointer hover:opacity-80 hover:border-gray-400 dark:hover:border-gray-600 transition-all"
                                                                                                                                    onClick={() =>
                                                                                                                                        window.open(
                                                                                                                                            imgUrl,
                                                                                                                                            "_blank"
                                                                                                                                        )
                                                                                                                                    }
                                                                                                                                />
                                                                                                                            )
                                                                                                                        )}
                                                                                                                    {doc
                                                                                                                        .metadata
                                                                                                                        .image_urls
                                                                                                                        .length >
                                                                                                                        3 && (
                                                                                                                        <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-700 flex items-center justify-center text-xs text-gray-600 dark:text-gray-400 font-medium">
                                                                                                                            +
                                                                                                                            {doc
                                                                                                                                .metadata
                                                                                                                                .image_urls
                                                                                                                                .length -
                                                                                                                                3}{" "}
                                                                                                                            more
                                                                                                                        </div>
                                                                                                                    )}
                                                                                                                </div>
                                                                                                            )}
                                                                                                    </div>
                                                                                                </CardContent>
                                                                                            </Card>
                                                                                        )
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}

                                                {isPending && (
                                                    <div className="flex gap-3 animate-in fade-in slide-in-from-bottom-2">
                                                        <Avatar className="h-8 w-8 flex-shrink-0 border border-gray-200 dark:border-gray-800">
                                                            <AvatarFallback className="bg-black dark:bg-white">
                                                                <Bot className="h-4 w-4 text-white dark:text-black" />
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <Card className="flex-1 border-gray-200 dark:border-gray-800 bg-white dark:bg-black shadow-sm">
                                                            <CardContent className="p-4">
                                                                <div className="flex items-center gap-3">
                                                                    <Loader2 className="h-4 w-4 animate-spin text-gray-900 dark:text-white" />
                                                                    <div className="flex-1">
                                                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                                            Searching papers...
                                                                        </p>
                                                                        <p className="text-xs text-gray-600 dark:text-gray-400">
                                                                            Finding relevant papers and extracting
                                                                            content & images
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </CardContent>
                                                        </Card>
                                                    </div>
                                                )}
                                            </div>
                                        </ScrollArea>
                                    </TabsContent>

                                    {/* Images Tab */}
                                    <TabsContent value="images" className="flex-1 overflow-auto mt-0">
                                        {messages.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center min-h-[40vh] text-gray-500 dark:text-gray-500 py-12">
                                                <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-30" />
                                                <p className="text-sm">Search for papers to see extracted images</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-6 pr-4 min-h-[40vh]">
                                                {messages
                                                    .filter(m => m.searchResult)
                                                    .map((message, msgIdx) => {
                                                        const allImages: Array<{
                                                            url: string;
                                                            title: string;
                                                            pmcid: string;
                                                        }> = [];

                                                        message.searchResult?.source_documents.forEach(doc => {
                                                            const imageUrls = doc.metadata.image_urls || [];
                                                            imageUrls.forEach(url => {
                                                                allImages.push({
                                                                    url,
                                                                    title: doc.metadata.title,
                                                                    pmcid: doc.metadata.pmcid,
                                                                });
                                                            });
                                                        });

                                                        if (allImages.length === 0) return null;

                                                        return (
                                                            <div key={msgIdx}>
                                                                <h3 className="font-medium mb-3 p-5 text-xs uppercase tracking-wider text-gray-700 dark:text-gray-300">
                                                                    Query: {message.searchResult?.query}
                                                                </h3>
                                                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-3">
                                                                    {allImages.map((img, idx) => (
                                                                        <Card
                                                                            key={idx}
                                                                            className="overflow-hidden border-gray-200 dark:border-gray-800 group hover:shadow-lg transition-all"
                                                                        >
                                                                            <img
                                                                                src={img.url}
                                                                                alt={`${img.title} - Image ${idx + 1}`}
                                                                                className="w-full h-48 object-cover cursor-pointer group-hover:opacity-90 transition-opacity"
                                                                                onClick={() =>
                                                                                    window.open(img.url, "_blank")
                                                                                }
                                                                                onError={e => {
                                                                                    const target =
                                                                                        e.target as HTMLImageElement;
                                                                                    target.src =
                                                                                        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect fill='%23f3f4f6' width='200' height='200'/%3E%3Ctext fill='%239ca3af' x='50%25' y='50%25' text-anchor='middle' dy='.3em'%3EImage unavailable%3C/text%3E%3C/svg%3E";
                                                                                }}
                                                                            />
                                                                            <CardContent className="p-3">
                                                                                <p className="text-xs font-medium truncate text-gray-900 dark:text-white">
                                                                                    {img.title}
                                                                                </p>
                                                                                <Badge
                                                                                    variant="outline"
                                                                                    className="text-xs mt-1.5 border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400 font-mono"
                                                                                >
                                                                                    {img.pmcid}
                                                                                </Badge>
                                                                            </CardContent>
                                                                        </Card>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                            </div>
                                        )}
                                    </TabsContent>

                                    {/* Workflow Tab */}
                                    <TabsContent value="workflow" className="flex-1 flex flex-col mt-0 p-0">
                                        {isLoadingWorkflow ? (
                                            <div className="h-full flex min-h-[40vh] items-center justify-center">
                                                <div className="text-center">
                                                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-900 dark:text-white" />
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                                        Generating workflow diagram...
                                                    </p>
                                                </div>
                                            </div>
                                        ) : !workflowData ? (
                                            <div className="h-full min-h-[40vh] flex items-center justify-center text-center text-gray-500 dark:text-gray-500 py-12">
                                                <div>
                                                    <Network className="h-12 w-12 mx-auto mb-4 opacity-30" />
                                                    <p className="text-sm">
                                                        Search for papers to see research workflow
                                                    </p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="relative h-full flex flex-col">
                                                {/* Control Buttons */}
                                                <div className="absolute top-2 right-2 z-10 flex gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() =>
                                                            setWorkflowTheme(
                                                                workflowTheme === "light" ? "dark" : "light"
                                                            )
                                                        }
                                                        className="bg-white/95 dark:bg-black/95 backdrop-blur border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900"
                                                    >
                                                        {workflowTheme === "light" ? (
                                                            <>
                                                                <Moon className="h-4 w-4 mr-2" />
                                                                Dark
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Sun className="h-4 w-4 mr-2" />
                                                                Light
                                                            </>
                                                        )}
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => setIsFullscreen(!isFullscreen)}
                                                        className="bg-white/95 dark:bg-black/95 backdrop-blur border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900"
                                                    >
                                                        {isFullscreen ? (
                                                            <>
                                                                <Minimize2 className="h-4 w-4 mr-2" />
                                                                Exit Fullscreen
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Maximize2 className="h-4 w-4 mr-2" />
                                                                Fullscreen
                                                            </>
                                                        )}
                                                    </Button>
                                                </div>

                                                {/* ReactFlow Container */}
                                                <div
                                                    className={`flex-1 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden ${
                                                        workflowTheme === "dark" ? "bg-gray-900" : "bg-white"
                                                    }`}
                                                >
                                                    <ReactFlow
                                                        nodes={nodes}
                                                        edges={edges}
                                                        onNodesChange={onNodesChange}
                                                        onEdgesChange={onEdgesChange}
                                                        onConnect={onConnect}
                                                        fitView
                                                        fitViewOptions={{ padding: 0.2, maxZoom: 1.5 }}
                                                        attributionPosition="bottom-left"
                                                        minZoom={0.1}
                                                        maxZoom={4}
                                                        defaultEdgeOptions={{
                                                            type: "smoothstep",
                                                            animated: false,
                                                        }}
                                                    >
                                                        <Background gap={16} size={1} />
                                                        <Controls showInteractive={false} />
                                                        <MiniMap
                                                            nodeStrokeWidth={3}
                                                            zoomable
                                                            pannable
                                                            className="!bg-background !border-2"
                                                        />
                                                    </ReactFlow>
                                                </div>
                                            </div>
                                        )}
                                    </TabsContent>

                                    {/* Fullscreen Overlay */}
                                    {isFullscreen && workflowData && (
                                        <div className="fixed inset-0 z-50 bg-background">
                                            <div className="h-full flex flex-col">
                                                {/* Fullscreen Header */}
                                                <div className="border-b p-4 flex items-center justify-between">
                                                    <div>
                                                        <h2 className="text-lg font-semibold flex items-center gap-2">
                                                            <Network className="h-5 w-5" />
                                                            Research Workflow
                                                        </h2>
                                                        <p className="text-sm text-muted-foreground mt-1">
                                                            Query: {workflowData.query} • {workflowData.num_papers}{" "}
                                                            papers
                                                        </p>
                                                    </div>
                                                    <Button variant="outline" onClick={() => setIsFullscreen(false)}>
                                                        <Minimize2 className="h-4 w-4 mr-2" />
                                                        Exit Fullscreen
                                                    </Button>
                                                </div>

                                                {/* Fullscreen ReactFlow */}
                                                <div className="flex-1 bg-background">
                                                    <ReactFlow
                                                        nodes={nodes}
                                                        edges={edges}
                                                        onNodesChange={onNodesChange}
                                                        onEdgesChange={onEdgesChange}
                                                        onConnect={onConnect}
                                                        fitView
                                                        fitViewOptions={{ padding: 0.2, maxZoom: 1.5 }}
                                                        attributionPosition="bottom-left"
                                                        minZoom={0.1}
                                                        maxZoom={4}
                                                        defaultEdgeOptions={{
                                                            type: "smoothstep",
                                                            animated: false,
                                                        }}
                                                    >
                                                        <Background gap={16} size={1} />
                                                        <Controls showInteractive={false} />
                                                        <MiniMap
                                                            nodeStrokeWidth={3}
                                                            zoomable
                                                            pannable
                                                            className="!bg-background !border-2"
                                                        />
                                                    </ReactFlow>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </Tabs>

                                {/* Search Input */}
                                <div className="border-t border-gray-200 dark:border-gray-800 pt-4 mt-4 px-5">
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="Ask about NASA space biology research..."
                                            value={inputValue}
                                            onChange={e => setInputValue(e.target.value)}
                                            onKeyPress={handleKeyPress}
                                            disabled={isPending}
                                            className="flex-1 h-11 border-gray-300 dark:border-gray-700 focus-visible:ring-gray-400 dark:focus-visible:ring-gray-600"
                                        />
                                        <Button
                                            onClick={handleSearch}
                                            disabled={isPending || !inputValue.trim()}
                                            size="lg"
                                            className="px-6 bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200"
                                        >
                                            {isPending ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <>
                                                    <Search className="h-4 w-4 mr-2" />
                                                    Search
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                                        Press Enter to search • ⚡ Smart search with auto paper extraction & images
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Fullscreen Workflow Overlay */}
                {isFullscreen && workflowData && (
                    <div className={`fixed inset-0 z-50 ${workflowTheme === "dark" ? "bg-gray-900" : "bg-white"}`}>
                        <div className="h-full flex flex-col">
                            {/* Fullscreen Header */}
                            <div className="border-b border-gray-200 dark:border-gray-800 p-4 flex items-center justify-between">
                                <div>
                                    <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
                                        <Network className="h-5 w-5" />
                                        Research Workflow
                                    </h2>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                        Query: {workflowData.query} • {workflowData.num_papers} papers
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setWorkflowTheme(workflowTheme === "light" ? "dark" : "light")}
                                        className="border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900"
                                    >
                                        {workflowTheme === "light" ? (
                                            <>
                                                <Moon className="h-4 w-4 mr-2" />
                                                Dark Mode
                                            </>
                                        ) : (
                                            <>
                                                <Sun className="h-4 w-4 mr-2" />
                                                Light Mode
                                            </>
                                        )}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => setIsFullscreen(false)}
                                        className="border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900"
                                    >
                                        <Minimize2 className="h-4 w-4 mr-2" />
                                        Exit Fullscreen
                                    </Button>
                                </div>
                            </div>

                            {/* Fullscreen ReactFlow */}
                            <div className={`flex-1 ${workflowTheme === "dark" ? "bg-gray-900" : "bg-white"}`}>
                                <ReactFlow
                                    nodes={nodes}
                                    edges={edges}
                                    onNodesChange={onNodesChange}
                                    onEdgesChange={onEdgesChange}
                                    onConnect={onConnect}
                                    fitView
                                    fitViewOptions={{ padding: 0.2, maxZoom: 1.5 }}
                                    attributionPosition="bottom-left"
                                    minZoom={0.1}
                                    maxZoom={4}
                                    defaultEdgeOptions={{
                                        type: "smoothstep",
                                        animated: false,
                                    }}
                                >
                                    <Background gap={16} size={1} />
                                    <Controls showInteractive={false} />
                                    <MiniMap
                                        nodeStrokeWidth={3}
                                        zoomable
                                        pannable
                                        className="!bg-background !border-2"
                                    />
                                </ReactFlow>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
