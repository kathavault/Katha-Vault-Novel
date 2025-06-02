// This file is machine-generated - edit at your own risk!

'use server';

/**
 * @fileOverview AI tool to generate story ideas based on theme, genre, and keywords.
 *
 * - generateStoryIdeas - A function that generates story ideas.
 * - GenerateStoryIdeasInput - The input type for the generateStoryIdeas function.
 * - GenerateStoryIdeasOutput - The return type for the generateStoryIdeas function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateStoryIdeasInputSchema = z.object({
  theme: z.string().describe('The theme of the story (e.g., love, revenge, adventure).'),
  genre: z.string().describe('The genre of the story (e.g., science fiction, fantasy, thriller).'),
  keywords: z.string().describe('Keywords related to the story, separated by commas.'),
});
export type GenerateStoryIdeasInput = z.infer<typeof GenerateStoryIdeasInputSchema>;

const GenerateStoryIdeasOutputSchema = z.object({
  storyIdeas: z.array(z.string()).describe('An array of story ideas based on the input.'),
});
export type GenerateStoryIdeasOutput = z.infer<typeof GenerateStoryIdeasOutputSchema>;

export async function generateStoryIdeas(input: GenerateStoryIdeasInput): Promise<GenerateStoryIdeasOutput> {
  return generateStoryIdeasFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateStoryIdeasPrompt',
  input: {schema: GenerateStoryIdeasInputSchema},
  output: {schema: GenerateStoryIdeasOutputSchema},
  prompt: `You are a creative writing assistant. Your task is to generate story ideas based on a given theme, genre, and keywords.

  Theme: {{{theme}}}
  Genre: {{{genre}}}
  Keywords: {{{keywords}}}

  Please provide 5 distinct story ideas. Each idea should be a short, concise description of a potential story.

  Format the output as a JSON array of strings.
  `, config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_ONLY_HIGH',
      },
    ],
  },
});

const generateStoryIdeasFlow = ai.defineFlow(
  {
    name: 'generateStoryIdeasFlow',
    inputSchema: GenerateStoryIdeasInputSchema,
    outputSchema: GenerateStoryIdeasOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
