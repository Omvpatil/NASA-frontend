import { config } from 'dotenv';
config();

import '@/ai/flows/summarize-publication.ts';
import '@/ai/flows/targeted-summary.ts';
import '@/ai/flows/analyze-consensus.ts';
import '@/ai/flows/chat-with-data.ts';
