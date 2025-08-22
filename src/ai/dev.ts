import { config } from 'dotenv';
config();

import '@/ai/flows/detect-language.ts';
import '@/ai/flows/audio-to-text.ts';
import '@/ai/flows/translate-sentences.ts';