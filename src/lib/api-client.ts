// src/lib/api-client.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export interface SearchQuery {
    query: string;
    num_results?: number;
    use_llm?: boolean;
    google_api_key?: string;
    model_name?: string;
}

export interface DocumentMetadata {
    title: string;
    source: string;
    pmcid: string;
    image_urls?: string[];
}

export interface DocumentResponse {
    page_content: string;
    metadata: DocumentMetadata;
    score?: number;
}

export interface SearchResponse {
    answer?: string;
    source_documents: DocumentResponse[];
    images_found: Array<{
        pmcid: string;
        title: string;
        images: string[];
    }>;
    papers_newly_scraped: number;
    papers_already_loaded: number;
    query: string;
    timestamp: string;
}

export interface WorkflowNode {
    id: string;
    type?: string;
    data: {
        label: string;
        pmcid?: string;
        title?: string;
        source?: string;
    };
    position: { x: number; y: number };
    style?: Record<string, any>;
}

export interface WorkflowEdge {
    id: string;
    source: string;
    target: string;
    type?: string;
    label?: string;
    animated?: boolean;
    style?: Record<string, any>;
}

export interface WorkflowResponse {
    nodes: WorkflowNode[];
    edges: WorkflowEdge[];
    query: string;
    num_papers: number;
}

export interface DatabaseStatus {
    status: string;
    collection_name: string;
    persist_directory: string;
    total_chunks: number;
    total_papers: number;
}

export interface Paper {
    id?: number;
    title: string;
    pmcid: string;
    link: string;
    isLoaded?: boolean;
    loadedAt?: string;
    chunksCreated?: number;
}

export interface DatabaseStats {
    total_papers: number;
    loaded_papers: number;
    unloaded_papers: number;
    total_chunks_created: number;
    database_path: string;
}

export interface LoadPapersRequest {
    num_papers: number;
}

export interface LoadPapersResponse {
    status: string;
    papers_loaded: number;
    chunks_created: number;
    message: string;
}

export interface Model {
    name: string;
    description: string;
}

class APIClient {
    private baseURL: string;

    constructor(baseURL = API_BASE_URL) {
        this.baseURL = baseURL;
    }

    private async fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
        const url = `${this.baseURL}${endpoint}`;

        try {
            const response = await fetch(url, {
                headers: {
                    "Content-Type": "application/json",
                    ...options?.headers,
                },
                ...options,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ detail: "Network error" }));
                throw new Error(errorData.detail || `HTTP ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`API Error (${endpoint}):`, error);
            throw error;
        }
    }

    // Health and Status
    async healthCheck() {
        return this.fetchAPI<{ status: string; database_loaded: boolean; timestamp: string }>("/health");
    }

    async getDatabaseStatus() {
        return this.fetchAPI<DatabaseStatus>("/database-status");
    }

    async getDatabaseStats() {
        return this.fetchAPI<DatabaseStats>("/database/stats");
    }

    // Paper Management
    async listPapers() {
        return this.fetchAPI<{ total_papers: number; papers: Paper[] }>("/papers");
    }

    async getLoadedPapers(limit?: number) {
        const params = limit ? `?limit=${limit}` : "";
        return this.fetchAPI<{ count: number; papers: Paper[] }>(`/database/papers/loaded${params}`);
    }

    async getUnloadedPapers(limit?: number) {
        const params = limit ? `?limit=${limit}` : "";
        return this.fetchAPI<{ count: number; papers: Paper[] }>(`/database/papers/unloaded${params}`);
    }

    async getAllPapersFromDB() {
        return this.fetchAPI<{ count: number; papers: Paper[] }>("/database/papers/all");
    }

    async searchPapersInDB(query: string, loadedOnly = false) {
        const params = new URLSearchParams({ query, loaded_only: loadedOnly.toString() });
        return this.fetchAPI<{ query: string; count: number; papers: Paper[] }>(`/database/papers/search?${params}`);
    }

    // Database Operations
    async loadCSVToDatabase() {
        return this.fetchAPI<{ status: string; message: string; stats: any }>("/database/load-csv", {
            method: "POST",
        });
    }

    async loadPapers(request: LoadPapersRequest) {
        return this.fetchAPI<LoadPapersResponse>("/load-papers", {
            method: "POST",
            body: JSON.stringify(request),
        });
    }

    async resetDatabase() {
        return this.fetchAPI<{ status: string; message: string }>("/reset-database", {
            method: "POST",
        });
    }

    async appendCSV(csvUrl: string) {
        return this.fetchAPI<{ status: string; message: string; stats: any }>("/database/append-csv", {
            method: "POST",
            body: JSON.stringify({ csv_url: csvUrl }),
        });
    }

    // Search Operations
    async search(query: SearchQuery) {
        return this.fetchAPI<SearchResponse>("/search", {
            method: "POST",
            body: JSON.stringify(query),
        });
    }

    async getWorkflow(query: SearchQuery) {
        return this.fetchAPI<WorkflowResponse>("/workflow", {
            method: "POST",
            body: JSON.stringify(query),
        });
    }

    // Models
    async listModels() {
        return this.fetchAPI<{ models: Model[] }>("/models");
    }
}

export const apiClient = new APIClient();
export default APIClient;
