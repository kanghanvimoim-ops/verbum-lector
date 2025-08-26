'use server';
import {createGenkitHandler} from '@genkit-ai/next/plugin';

export const {GET, POST} = createGenkitHandler({
  flows: [],
});
