'use server';
import {genkitNext} from '@genkit-ai/next';
import {
  detectLanguage,
  convertAudioToText,
  translateSentences,
} from '@/ai/dev';

export const {GET, POST} = genkitNext({
  flows: [detectLanguage, convertAudioToText, translateSentences],
});
