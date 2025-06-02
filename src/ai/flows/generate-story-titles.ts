'use server';

/**
 * @fileOverview AI tool to generate catchy titles for stories based on a short description.
 *
 * - generateStoryTitles - A function that generates story titles.
 * - GenerateStoryTitlesInput - The input type for the generateStoryTitles function.
 * - GenerateStoryTitlesOutput - The return type for the generateStoryTitles function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateStoryTitlesInputSchema = z.object({
  storyDescription: z
    .string()
    .describe('A short description of the story for which to generate titles.'),
});

export type GenerateStoryTitlesInput = z.infer<typeof GenerateStoryTitlesInputSchema>;

const GenerateStoryTitlesOutputSchema = z.object({
  titles: z
    .array(z.string())
    .describe('An array of catchy story titles generated based on the description.'),
});

export type GenerateStoryTitlesOutput = z.infer<typeof GenerateStoryTitlesOutputSchema>;

export async function generateStoryTitles(input: GenerateStoryTitlesInput): Promise<GenerateStoryTitlesOutput> {
  return generateStoryTitlesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateStoryTitlesPrompt',
  input: {schema: GenerateStoryTitlesInputSchema},
  output: {schema: GenerateStoryTitlesOutputSchema},
  prompt: `You are a creative title generator for stories. Generate 5 catchy titles for the following story description:\n\n{{{storyDescription}}}`,
});

const generateStoryTitlesFlow = ai.defineFlow(
  {
    name: 'generateStoryTitlesFlow',
    inputSchema: GenerateStoryTitlesInputSchema,
    outputSchema: GenerateStoryTitlesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
