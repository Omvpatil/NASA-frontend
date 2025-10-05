"use server";
import { apiClient } from "@/lib/api-client";

export async function searchPapersAction(
    query: string,
    numResults = 10,
    useLLM = true,
    googleApiKey?: string,
    modelName = "gemini-2.5-flash"
) {
    try {
        const result = await apiClient.search({
            query,
            num_results: numResults,
            use_llm: useLLM,
            google_api_key: googleApiKey,
            model_name: modelName,
        });
        return { result, error: null };
    } catch (error) {
        console.error(error);
        return { result: null, error: "Failed to search papers. Please try again." };
    }
}

export async function loadPapersAction(numPapers: number) {
    try {
        const result = await apiClient.loadPapers({ num_papers: numPapers });
        return { result, error: null };
    } catch (error) {
        console.error(error);
        return { result: null, error: "Failed to load papers. Please try again." };
    }
}

export async function loadCSVToDatabaseAction() {
    try {
        const result = await apiClient.loadCSVToDatabase();
        return { result, error: null };
    } catch (error) {
        console.error(error);
        return { result: null, error: "Failed to load CSV to database. Please try again." };
    }
}

export async function resetDatabaseAction() {
    try {
        const result = await apiClient.resetDatabase();
        return { result, error: null };
    } catch (error) {
        console.error(error);
        return { result: null, error: "Failed to reset database. Please try again." };
    }
}

export async function getWorkflowAction(
    query: string,
    numResults = 10,
    googleApiKey?: string,
    modelName = "gemini-2.5-flash"
) {
    try {
        const result = await apiClient.getWorkflow({
            query,
            num_results: numResults,
            use_llm: false, // Workflow doesn't need LLM
            google_api_key: googleApiKey,
            model_name: modelName,
        });
        return { result, error: null };
    } catch (error) {
        console.error(error);
        return { result: null, error: "Failed to generate workflow. Please try again." };
    }
}
