// src/ai/flows/improve-story-draft.ts
'use server';

/**
 * @fileOverview An AI tool that improves story drafts by providing suggestions for grammar, style, and clarity.
 *
 * - improveStoryDraft - A function that takes a story draft and returns an improved version.
 * - ImproveStoryDraftInput - The input type for the improveStoryDraft function.
 * - ImproveStoryDraftOutput - The return type for the improveStoryDraft function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ImproveStoryDraftInputSchema = z.object({
  storyDraft: z
    .string()
    .describe('The story draft to be improved.'),
});
export type ImproveStoryDraftInput = z.infer<typeof ImproveStoryDraftInputSchema>;

const ImproveStoryDraftOutputSchema = z.object({
  improvedStoryDraft: z
    .string()
    .describe('The improved story draft with suggestions for grammar, style, and clarity.'),
});
export type ImproveStoryDraftOutput = z.infer<typeof ImproveStoryDraftOutputSchema>;

export async function improveStoryDraft(input: ImproveStoryDraftInput): Promise<ImproveStoryDraftOutput> {
  return improveStoryDraftFlow(input);
}

const improveStoryDraftPrompt = ai.definePrompt({
  name: 'improveStoryDraftPrompt',
  input: {schema: ImproveStoryDraftInputSchema},
  output: {schema: ImproveStoryDraftOutputSchema},
  prompt: `You are a writing assistant designed to improve story drafts. Review the following story draft and provide an improved version with suggestions for grammar, style, and clarity.\n\nStory Draft: {{{storyDraft}}}\n\nImproved Story Draft:`, 
});

const improveStoryDraftFlow = ai.defineFlow(
  {
    name: 'improveStoryDraftFlow',
    inputSchema: ImproveStoryDraftInputSchema,
    outputSchema: ImproveStoryDraftOutputSchema,
  },
  async input => {
    const {output} = await improveStoryDraftPrompt(input);
    return output!;
  }
);
