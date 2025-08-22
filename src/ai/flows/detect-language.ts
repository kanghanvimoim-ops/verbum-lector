'use server';
/**
 * @fileOverview Detects the spoken language from an audio/video file.
 *
 * - detectLanguage - A function that handles the language detection process.
 * - DetectLanguageInput - The input type for the detectLanguage function.
 * - DetectLanguageOutput - The return type for the detectLanguage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DetectLanguageInputSchema = z.object({
  audioDataUri: z
    .string()
    .describe(
      "An audio or video file, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type DetectLanguageInput = z.infer<typeof DetectLanguageInputSchema>;

const DetectLanguageOutputSchema = z.object({
  languageCode: z
    .string()
    .describe('The detected language code (e.g., \'vi\' for Vietnamese, \'ko\' for Korean).'),
  confidence: z.number().describe('The confidence level of the language detection (0-1).'),
});
export type DetectLanguageOutput = z.infer<typeof DetectLanguageOutputSchema>;

export async function detectLanguage(input: DetectLanguageInput): Promise<DetectLanguageOutput> {
  return detectLanguageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'detectLanguagePrompt',
  input: {schema: DetectLanguageInputSchema},
  output: {schema: DetectLanguageOutputSchema},
  prompt: `You are an expert in language detection.

Analyze the provided audio/video file and determine the spoken language. Return the language code and your confidence level.

Audio/Video File: {{media url=audioDataUri}}

Respond with a JSON object that contains \"languageCode\" (e.g., \"vi\" for Vietnamese, \"ko\" for Korean) and \"confidence\" (a number between 0 and 1 indicating the confidence level). Be brief, and respond ONLY with the JSON object.`,
});

const detectLanguageFlow = ai.defineFlow(
  {
    name: 'detectLanguageFlow',
    inputSchema: DetectLanguageInputSchema,
    outputSchema: DetectLanguageOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
