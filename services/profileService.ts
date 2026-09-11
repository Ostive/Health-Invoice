import type { UserProfile } from '@/types';
import { api } from './api';

// Browser side of /api/profile (the first load comes from the server render)
export const ProfileService = {
    fetch: () => api<UserProfile>('/api/profile'),
};
