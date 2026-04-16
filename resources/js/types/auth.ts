export type User = {
    id: number;
    employee_number: string | null;
    first_name: string;
    last_name: string;
    email: string | null;
    avatar?: string;
    is_active: boolean;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
};

import type { NavItem } from './navigation';

export type Auth = {
    user: User;
    roles: string[];
    permissions: string[];
    navigation?: NavItem[];
};
