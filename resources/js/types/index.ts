export type * from './auth';
export type * from './navigation';
export type * from './ui';
export type * from './notifications';

import type { Auth } from './auth';

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: Auth;
    appNotifications?: {
        unread_count: number;
    };
    [key: string]: unknown;
};
