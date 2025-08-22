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
  prompt: `You are an expert transcriptionist. Please transcribe the audio provided in the audioDataUri into text, and then split the transcribed text into individual sentences.\n\nAudio: {{media url=audioDataUri}}\n\nEnsure that the output is a valid JSON object with \"transcript\" and \"sentences\" fields. The \"sentences\" field must be a JSON array of strings.`, 
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
