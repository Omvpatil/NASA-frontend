// src/ai/flows/analyze-consensus.ts
'use server';

/**
 * @fileOverview An AI agent that analyzes research consensus on a given topic.
 *
 * - analyzeTopicConsensus - A function that handles the consensus analysis process.
 * - AnalyzeConsensusInput - The input type for the analyzeTopicConsensus function.
 * - AnalyzeConsensusOutput - The return type for the analyzeTopicConsensus function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { getPublications } from '@/lib/osdr';

const AnalyzeConsensusInputSchema = z.object({
  topic: z.string().describe('The research topic to analyze for consensus.'),
});
export type AnalyzeConsensusInput = z.infer<typeof AnalyzeConsensusInputSchema>;

const AnalyzeConsensusOutputSchema = z.object({
  state: z
    .enum(['consistent', 'mixed', 'contradictory'])
    .describe(
      'The overall state of consensus on the topic. "consistent" if findings agree, "mixed" if they vary, and "contradictory" if they conflict.'
    ),
  supportingPublications: z.array(z.string()).describe('A list of publication IDs that support the consensus state.'),
});
export type AnalyzeConsensusOutput = z.infer<typeof AnalyzeConsensusOutputSchema>;


const findRelevantPublicationsTool = ai.defineTool(
    {
        name: 'findRelevantPublications',
        description: 'Finds publications related to a specific research topic, providing their summaries.',
        inputSchema: z.object({
            topic: z.string().describe('The topic to search for.'),
        }),
        outputSchema: z.object({
            publications: z.array(z.object({
                id: z.string(),
                summary: z.string(),
            }))
        }),
    },
    async (input) => {
        const publications = await getPublications();
        const relevantPublications = publications
            .filter(p => p.topics.includes(input.topic))
            .map(p => ({ id: p.id, summary: p.summary }));
        return { publications: relevantPublications };
    }
);


export async function analyzeTopicConsensus(
  input: AnalyzeConsensusInput
): Promise<AnalyzeConsensusOutput> {
  return analyzeConsensusFlow(input);
}


const prompt = ai.definePrompt({
  name: 'analyzeConsensusPrompt',
  input: {schema: AnalyzeConsensusInputSchema},
  output: {schema: AnalyzeConsensusOutputSchema},
  tools: [findRelevantPublicationsTool],
  prompt: `You are an expert research analyst. Your task is to determine the consensus of scientific findings on a given topic by analyzing the summaries of multiple publications.

  The user wants to know the consensus on the topic: {{{topic}}}.

  1. Use the findRelevantPublications tool to get a list of summaries for this topic.
  2. Read through all the summaries provided by the tool.
  3. Based on the findings presented in the summaries, classify the consensus as 'consistent', 'mixed', or 'contradictory'.
     - 'consistent': Most or all publications report similar findings or conclusions.
     - 'mixed': Publications report varied, but not directly conflicting, findings. They might explore different facets of the topic.
     - 'contradictory': Publications report opposing or conflicting findings.
  4. Return a list of the publication IDs you based your decision on. Select up to 5 of the most representative publications.
  `,
});

const analyzeConsensusFlow = ai.defineFlow(
  {
    name: 'analyzeConsensusFlow',
    inputSchema: AnalyzeConsensusInputSchema,
    outputSchema: AnalyzeConsensusOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
