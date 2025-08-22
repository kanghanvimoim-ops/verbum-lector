'use server';

/**
 * @fileOverview Converts audio from an uploaded file into text and splits it into sentences.
 *
 * - convertAudioToText - A function that handles the audio-to-text conversion process.
 * - ConvertAudioToTextInput - The input type for the convertAudioToText function.
 * - ConvertAudioToTextOutput - The return type for the convertAudioToText function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ConvertAudioToTextInputSchema = z.object({
  audioDataUri: z
    .string()
    .describe(
      'The audio file data as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.'
    ),
});
export type ConvertAudioToTextInput = z.infer<typeof ConvertAudioToTextInputSchema>;

const ConvertAudioToTextOutputSchema = z.object({
  transcript: z.string().describe('The full transcript of the audio file.'),
  sentences: z.array(z.string()).describe('An array of sentences from the transcript.'),
});
export type ConvertAudioToTextOutput = z.infer<typeof ConvertAudioToTextOutputSchema>;

export async function convertAudioToText(input: ConvertAudioToTextInput): Promise<ConvertAudioToTextOutput> {
  return convertAudioToTextFlow(input);
}

const audioToTextPrompt = ai.definePrompt({
  name: 'audioToTextPrompt',
  input: {schema: ConvertAudioToTextInputSchema},
  output: {schema: ConvertAudioToTextOutputSchema},
  prompt: `You are an expert transcriptionist.
1.  First, transcribe the entire audio provided in the audioDataUri into a single block of text. This will be your 'transcript'.
2.  Second, split that full transcript into an array of individual sentences. This will be your 'sentences'.

Audio: {{media url=audioDataUri}}

Ensure that the final output is a valid JSON object with both a "transcript" field (containing the full text) and a "sentences" field (containing the array of sentences).`,
});

const convertAudioToTextFlow = ai.defineFlow(
  {
    name: 'convertAudioToTextFlow',
    inputSchema: ConvertAudioToTextInputSchema,
    outputSchema: ConvertAudioToTextOutputSchema,
  },
  async input => {
    const {output} = await audioToTextPrompt(input);
    return output!;
  }
);
