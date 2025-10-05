'use server';

/**
 * @fileOverview This file defines a Genkit flow for summarizing NASA bioscience publications.
 *
 * - summarizePublication - A function that takes a publication text and returns a summary.
 * - SummarizePublicationInput - The input type for the summarizePublication function.
 * - SummarizePublicationOutput - The return type for the summarizePublication function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizePublicationInputSchema = z.object({
  publicationText: z
    .string()
    .describe('The complete text content of the NASA bioscience publication.'),
  sectionsToSummarize: z
    .array(z.enum(['Introduction', 'Results', 'Conclusion']))
    .optional()
    .describe('Optional array specifying which sections of the publication to summarize. If empty, the entire publication will be summarized.'),
});
export type SummarizePublicationInput = z.infer<typeof SummarizePublicationInputSchema>;

const SummarizePublicationOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the NASA bioscience publication.'),
});
export type SummarizePublicationOutput = z.infer<typeof SummarizePublicationOutputSchema>;

export async function summarizePublication(input: SummarizePublicationInput): Promise<SummarizePublicationOutput> {
  return summarizePublicationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizePublicationPrompt',
  input: {schema: SummarizePublicationInputSchema},
  output: {schema: SummarizePublicationOutputSchema},
  prompt: `You are an expert science communicator. You will summarize a NASA bioscience publication.

  Here is the publication text: {{{publicationText}}}

  {% if sectionsToSummarize %}
  Focus your summary on the following sections: {{sectionsToSummarize}}
  {% endif %}
  
  Provide a concise summary of the key findings and impacts of the publication.
  `,
});

const summarizePublicationFlow = ai.defineFlow(
  {
    name: 'summarizePublicationFlow',
    inputSchema: SummarizePublicationInputSchema,
    outputSchema: SummarizePublicationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
