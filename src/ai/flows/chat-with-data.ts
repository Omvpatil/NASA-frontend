// src/ai/flows/chat-with-data.ts
'use server';

/**
 * @fileOverview A flow that allows a user to ask questions about the publication dataset.
 * It uses a Retrieval-Augmented Generation (RAG) pattern.
 *
 * - chatWithData - The main function that orchestrates the RAG process.
 * - ChatInput - The input schema for the user's question.
 * - ChatOutput - The output schema for the AI's answer and sources.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { getPublications } from '@/lib/osdr';
import type { Publication } from '@/lib/publication-type';

const ChatInputSchema = z.object({
  question: z.string().describe('The user\'s question about the publications.'),
});
export type ChatInput = z.infer<typeof ChatInputSchema>;

const ChatOutputSchema = z.object({
  answer: z.string().describe('The AI-generated answer to the user\'s question.'),
  sources: z.array(z.string()).describe('An array of publication IDs used as sources for the answer.'),
});
export type ChatOutput = z.infer<typeof ChatOutputSchema>;

// This tool finds relevant publications based on a user's question.
// In a real-world scenario, this would likely use a vector database for semantic search.
// For this example, we'll perform a simple keyword search across titles and summaries.
const findRelevantSourcesTool = ai.defineTool(
    {
        name: 'findRelevantSources',
        description: 'Finds publications relevant to a user\'s question.',
        inputSchema: z.object({
            query: z.string().describe('The user\'s question to find sources for.'),
        }),
        outputSchema: z.object({
            sources: z.array(z.object({
                id: z.string(),
                title: z.string(),
                summary: z.string(),
            }))
        }),
    },
    async (input) => {
        const publications = await getPublications();
        const query = input.query.toLowerCase();
        const queryWords = query.split(/\s+/).filter(w => w.length > 2); // Split query into words

        const relevantPubs = publications.filter(pub => {
            const content = `${pub.title.toLowerCase()} ${pub.summary.toLowerCase()}`;
            return queryWords.some(word => content.includes(word));
        });

        // Return a limited number of the most relevant sources
        return {
            sources: relevantPubs.slice(0, 5).map(p => ({
                id: p.id,
                title: p.title,
                summary: p.summary,
            }))
        };
    }
);


export async function chatWithData(
  input: ChatInput
): Promise<ChatOutput> {
  return chatWithDataFlow(input);
}


const prompt = ai.definePrompt({
  name: 'chatPrompt',
  input: {schema: ChatInputSchema},
  output: {schema: ChatOutputSchema},
  tools: [findRelevantSourcesTool],
  prompt: `You are an expert research assistant for NASA bioscience.
  Your task is to answer the user's question based on the provided scientific publications.

  The user's question is: {{{question}}}

  1. First, use the findRelevantSources tool to find publications related to the user's question.
  2. Synthesize an answer to the user's question based *only* on the information in the provided sources.
  3. Do not make up information or use any external knowledge.
  4. Your answer should be concise and directly address the question.
  5. Finally, you MUST cite the publications you used by providing their IDs in the 'sources' array of the output.
  `,
});

const chatWithDataFlow = ai.defineFlow(
  {
    name: 'chatWithDataFlow',
    inputSchema: ChatInputSchema,
    outputSchema: ChatOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
