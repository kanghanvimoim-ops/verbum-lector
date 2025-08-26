import { config } from 'dotenv';
config();

// IMPORTANT: Export all flows so that they can be discovered by the Next.js plugin.
export * from '@/ai/flows/detect-language';
export * from '@/ai/flows/audio-to-text';
export * from '@/ai/flows/translate-sentences';
