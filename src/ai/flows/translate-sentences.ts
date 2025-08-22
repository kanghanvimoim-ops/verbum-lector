// This file is machine-generated - edit at your own risk.

'use server';

/**
 * @fileOverview A translation AI agent that translates between Vietnamese and Korean.
 *
 * - translateSentences - A function that handles the translation process.
 * - TranslateSentencesInput - The input type for the translateSentences function.
 * - TranslateSentencesOutput - The return type for the translateSentences function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TranslateSentencesInputSchema = z.object({
  sentences: z.array(z.string()).describe('An array of sentences to translate.'),
  sourceLanguage: z
    .string()
    .describe('The language of the input sentences (either Vietnamese or Korean).'),
  targetLanguage: z
    .string()
    .describe('The language to translate the sentences to (either Vietnamese or Korean).'),
});
export type TranslateSentencesInput = z.infer<typeof TranslateSentencesInputSchema>;

const TranslateSentencesOutputSchema = z.object({
  translatedSentences: z
    .array(z.string())
    .describe('An array of the translated sentences.'),
});
export type TranslateSentencesOutput = z.infer<typeof TranslateSentencesOutputSchema>;

export async function translateSentences(input: TranslateSentencesInput): Promise<TranslateSentencesOutput> {
  return translateSentencesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'translateSentencesPrompt',
  input: {schema: TranslateSentencesInputSchema},
  output: {schema: TranslateSentencesOutputSchema},
  prompt: `You are a professional translator specializing in Vietnamese and Korean.

You will be given an array of sentences in {{sourceLanguage}} that you must translate to {{targetLanguage}}.

Sentences:
{{#each sentences}}
- {{{this}}}
{{/each}}

Ensure the translated sentences maintain the original meaning and context as accurately as possible.

Return the translated sentences as an array of strings.
`,
});

const translateSentencesFlow = ai.defineFlow(
  {
    name: 'translateSentencesFlow',
    inputSchema: TranslateSentencesInputSchema,
    outputSchema: TranslateSentencesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
