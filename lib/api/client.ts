import { mockClient } from './mock/client';
import { realClient } from './real/client';

const isMock = process.env.NEXT_PUBLIC_API_MODE === 'mock';

export const api = isMock ? mockClient : realClient;
