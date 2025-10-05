// src/ai/flows/targeted-summary.ts
'use server';

/**
 * @fileOverview An AI agent that summarizes specific sections of a NASA bioscience paper.
 *
 * - summarizeTargetedSections - A function that handles the summarization process.
 * - TargetedSummaryInput - The input type for the summarizeTargetedSections function.
 * - TargetedSummaryOutput - The return type for the summarizeTargetedSections function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TargetedSummaryInputSchema = z.object({
  publicationText: z
    .string()
    .describe('The full text content of the NASA bioscience publication.'),
  sectionsToSummarize: z
    .array(z.string())
    .describe(
      'An array of section names (e.g., Introduction, Results, Conclusion) to summarize.  If empty, the whole paper is summarized.'
    ),
});
export type TargetedSummaryInput = z.infer<typeof TargetedSummaryInputSchema>;

const TargetedSummaryOutputSchema = z.object({
  summary: z.string().describe('The AI-powered summary of the selected sections.'),
});
export type TargetedSummaryOutput = z.infer<typeof TargetedSummaryOutputSchema>;

export async function summarizeTargetedSections(
  input: TargetedSummaryInput
): Promise<TargetedSummaryOutput> {
  return targetedSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'targetedSummaryPrompt',
  input: {schema: TargetedSummaryInputSchema},
  output: {schema: TargetedSummaryOutputSchema},
  prompt: `You are an AI assistant tasked with summarizing specific sections of a NASA bioscience publication.

  The publication text is provided below:
  {{publicationText}}

  The user has requested a summary of the following sections:
  {{#if sectionsToSummarize}}
  {{#each sectionsToSummarize}}
  - {{{this}}}
  {{/each}}
  {{else}}
  The entire publication
  {{/if}}

  Generate a concise and informative summary that focuses on the key findings and impacts discussed in the selected sections.
  If no sections are specified, summarize the entire document.
  `,
});

const targetedSummaryFlow = ai.defineFlow(
  {
    name: 'targetedSummaryFlow',
    inputSchema: TargetedSummaryInputSchema,
    outputSchema: TargetedSummaryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
