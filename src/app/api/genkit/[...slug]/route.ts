'use server';
import {createGenkitHandler} from '@genkit-ai/next';

export const {GET, POST} = createGenkitHandler({
  flows: [],
});
