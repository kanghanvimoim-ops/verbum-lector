'use server';
import {createGenkitHandler} from '@genkit-ai/next';
import * as flows from '@/ai/dev';

export const {GET, POST} = createGenkitHandler({
  flows: Object.values(flows),
});
