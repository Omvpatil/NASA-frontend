// src/components/markdown-renderer.tsx
"use client";
import { useState } from "react";
import { Badge } from "./ui/badge";
import { Card, CardContent } from "./ui/card";

interface MarkdownRendererProps {
    content: string;
    className?: string;
}

export default function MarkdownRenderer({ content, className = "" }: MarkdownRendererProps) {
    const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

    const handleImageError = (url: string) => {
        setImageErrors(prev => new Set(prev).add(url));
    };

    // Parse markdown-like content manually for better control
    const parseMarkdown = (text: string) => {
        const lines = text.split("\n");
        const elements: JSX.Element[] = [];
        let inCodeBlock = false;
        let codeBlockContent: string[] = [];
        let listItems: string[] = [];
        let inList = false;

        lines.forEach((line, index) => {
            // Code blocks
            if (line.trim().startsWith("```")) {
                if (inCodeBlock) {
                    elements.push(
                        <pre
                            key={`code-${index}`}
                            className="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg overflow-x-auto my-3 border border-gray-200 dark:border-gray-800"
                        >
                            <code className="text-sm font-mono">{codeBlockContent.join("\n")}</code>
                        </pre>
                    );
                    codeBlockContent = [];
                }
                inCodeBlock = !inCodeBlock;
                return;
            }

            if (inCodeBlock) {
                codeBlockContent.push(line);
                return;
            }

            // Images: ![alt text](url) or ![alt text](url "title")
            const imageMatch = line.match(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)/g);
            if (imageMatch) {
                imageMatch.forEach((match, imgIdx) => {
                    const parts = match.match(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)/);
                    if (parts) {
                        const alt = parts[1] || "Research Figure";
                        const url = parts[2];
                        const title = parts[3] || alt;

                        // Extract PMCID from alt text if present
                        const pmcidMatch = alt.match(/PMC\d+/i);
                        const pmcid = pmcidMatch ? pmcidMatch[0] : "";

                        if (!imageErrors.has(url)) {
                            elements.push(
                                <Card
                                    key={`img-${index}-${imgIdx}`}
                                    className="my-4 overflow-hidden border-gray-200 dark:border-gray-800 group hover:shadow-lg transition-all max-w-md"
                                >
                                    <img
                                        src={url}
                                        alt={alt}
                                        className="w-full h-auto max-h-64 object-contain cursor-pointer group-hover:opacity-90 transition-opacity bg-gray-50 dark:bg-gray-900"
                                        onClick={() => window.open(url, "_blank")}
                                        onError={() => handleImageError(url)}
                                    />
                                    <CardContent className="p-3 border-t border-gray-200 dark:border-gray-800">
                                        <p className="text-xs font-medium text-gray-900 dark:text-white mb-1">
                                            {title}
                                        </p>
                                        {pmcid && (
                                            <Badge
                                                variant="outline"
                                                className="text-xs border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400 font-mono"
                                            >
                                                {pmcid}
                                            </Badge>
                                        )}
                                    </CardContent>
                                </Card>
                            );
                        }
                    }
                });
                // Remove image markdown from line for text rendering
                line = line.replace(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)/g, "");
            }

            // Headers
            if (line.startsWith("### ")) {
                elements.push(
                    <h3 key={index} className="text-lg font-semibold mt-4 mb-2 text-gray-900 dark:text-white">
                        {line.substring(4)}
                    </h3>
                );
            } else if (line.startsWith("## ")) {
                elements.push(
                    <h2 key={index} className="text-xl font-bold mt-6 mb-3 text-gray-900 dark:text-white">
                        {line.substring(3)}
                    </h2>
                );
            } else if (line.startsWith("# ")) {
                elements.push(
                    <h1 key={index} className="text-2xl font-bold mt-6 mb-4 text-gray-900 dark:text-white">
                        {line.substring(2)}
                    </h1>
                );
            }
            // Bold text
            else if (line.includes("**")) {
                const parts = line.split("**");
                const formatted = parts.map((part, i) =>
                    i % 2 === 1 ? (
                        <strong key={i} className="font-semibold text-gray-900 dark:text-white">
                            {part}
                        </strong>
                    ) : (
                        part
                    )
                );
                elements.push(
                    <p key={index} className="mb-2 text-gray-700 dark:text-gray-300">
                        {formatted}
                    </p>
                );
            }
            // Links: [text](url)
            else if (line.includes("[") && line.includes("](")) {
                const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
                const parts: (string | JSX.Element)[] = [];
                let lastIndex = 0;
                let match;

                while ((match = linkRegex.exec(line)) !== null) {
                    if (match.index > lastIndex) {
                        parts.push(line.substring(lastIndex, match.index));
                    }
                    parts.push(
                        <a
                            key={match.index}
                            href={match[2]}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-900 dark:text-white underline hover:text-gray-600 dark:hover:text-gray-300"
                        >
                            {match[1]}
                        </a>
                    );
                    lastIndex = match.index + match[0].length;
                }

                if (lastIndex < line.length) {
                    parts.push(line.substring(lastIndex));
                }

                elements.push(
                    <p key={index} className="mb-2 text-gray-700 dark:text-gray-300">
                        {parts}
                    </p>
                );
            }
            // Lists
            else if (line.trim().match(/^[-*•]\s/)) {
                if (!inList) {
                    inList = true;
                    listItems = [];
                }
                listItems.push(line.trim().substring(2));
            } else {
                if (inList) {
                    elements.push(
                        <ul key={`list-${index}`} className="list-disc list-inside mb-3 space-y-1">
                            {listItems.map((item, i) => (
                                <li key={i} className="text-sm text-gray-700 dark:text-gray-300">
                                    {item}
                                </li>
                            ))}
                        </ul>
                    );
                    inList = false;
                    listItems = [];
                }
                // Regular paragraphs
                if (line.trim()) {
                    // Inline code
                    if (line.includes("`")) {
                        const parts = line.split("`");
                        const formatted = parts.map((part, i) =>
                            i % 2 === 1 ? (
                                <code
                                    key={i}
                                    className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm font-mono text-gray-900 dark:text-gray-100"
                                >
                                    {part}
                                </code>
                            ) : (
                                part
                            )
                        );
                        elements.push(
                            <p key={index} className="mb-2 text-gray-700 dark:text-gray-300">
                                {formatted}
                            </p>
                        );
                    } else {
                        elements.push(
                            <p key={index} className="mb-2 text-gray-700 dark:text-gray-300">
                                {line}
                            </p>
                        );
                    }
                } else {
                    elements.push(<div key={index} className="h-2" />);
                }
            }
        });

        // Close any remaining list
        if (inList) {
            elements.push(
                <ul key="final-list" className="list-disc list-inside mb-3 space-y-1">
                    {listItems.map((item, i) => (
                        <li key={i} className="text-sm text-gray-700 dark:text-gray-300">
                            {item}
                        </li>
                    ))}
                </ul>
            );
        }

        return elements;
    };

    return <div className={`prose prose-sm max-w-none ${className}`}>{parseMarkdown(content)}</div>;
}
