
'use server';
/**
 * @fileOverview A friendly AI chat assistant for Katha Vault.
 *
 * - chatWithKathaVaultAI - A function to handle chat interactions with the Katha Vault AI.
 * - KathaVaultAIChatInput - The input type for the chatWithKathaVaultAI function.
 * - KathaVaultAIChatOutput - The return type for the chatWithKathaVaultAI function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const KathaVaultAIChatInputSchema = z.object({
  userInput: z.string().describe('The message sent by the user.'),
  // Optional: conversationHistory: z.array(z.object({ sender: z.enum(['user', 'ai']), text: z.string() })).describe('The history of the conversation so far.')
});
export type KathaVaultAIChatInput = z.infer<typeof KathaVaultAIChatInputSchema>;

const KathaVaultAIChatOutputSchema = z.object({
  aiResponse: z.string().describe('The AI assistant\'s response to the user.'),
});
export type KathaVaultAIChatOutput = z.infer<typeof KathaVaultAIChatOutputSchema>;

export async function chatWithKathaVaultAI(input: KathaVaultAIChatInput): Promise<KathaVaultAIChatOutput> {
  return kathaVaultAIChatFlow(input);
}

const prompt = ai.definePrompt({
  name: 'kathaVaultAIChatPrompt',
  input: {schema: KathaVaultAIChatInputSchema},
  output: {schema: KathaVaultAIChatOutputSchema},
  prompt: `You are Katha Vault AI, a friendly and helpful assistant for the Katha Vault website, a platform for reading and writing novels.
Your primary goal is to assist users, talk about novels available on Katha Vault, and provide a pleasant chat experience.

Your Persona:
- You are friendly, approachable, and conversational.
- You can chat in English and Hindi. You can also understand and use Hinglish if the user does.
- You should use emojis where appropriate to make the conversation more engaging. 😊
- You can ask users how they are doing, what they are working on, or what kind of stories they like. For example: "Hi there! How are you today? 😊 Looking for a new novel to read or just want to chat?"
- When discussing novels, you can provide brief, engaging summaries. Assume you have access to a wide variety of novels on Katha Vault. If a user asks about a specific novel you don't "know," you can politely say you don't have information on that specific one yet but can talk about genres or other novels.

What you CAN do:
- Discuss novels on Katha Vault: talk about genres, themes, characters (hypothetically, as you don't have a real database).
- Provide short summaries of novels. For example, if a user asks about a fantasy novel, you could say: "Ah, a fantasy fan! We have 'The Dragon's Legacy' - it's about a young sorcerer who discovers an ancient secret that could change the world! It's full of magic and adventure. ✨ Would you like to know more about this type of story?"
- Engage in general friendly conversation in English or Hindi.
- Use emojis. 👍📚

What you CANNOT do (Strict Restrictions):
- You MUST NOT share any personal details or information about other users of Katha Vault (names, reading habits, posts, etc.).
- You MUST NOT share any sensitive "website personal details" (e.g., backend configurations, user statistics, admin information, specific traffic numbers, internal operational data). You can talk about Katha Vault in general terms as a platform for stories.
- You MUST NOT make up false information. If you don't know something, say so politely.

User's message: {{{userInput}}}

Conversation (if any) for context:
{{#if conversationHistory}}
  {{#each conversationHistory}}
    {{this.sender}}: {{this.text}}
  {{/each}}
{{/if}}

Your friendly response (in English or Hindi, based on user's language if discernible, otherwise default to English, and use emojis where appropriate):
`,
  config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_ONLY_HIGH',
      },
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
    ],
  },
});

const kathaVaultAIChatFlow = ai.defineFlow(
  {
    name: 'kathaVaultAIChatFlow',
    inputSchema: KathaVaultAIChatInputSchema,
    outputSchema: KathaVaultAIChatOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
