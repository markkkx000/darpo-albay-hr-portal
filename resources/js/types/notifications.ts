export interface NotificationData {
    type: 'announcement' | 'directed' | 'system';
    subtype?: string;
    title: string;
    body: string;
    from: string;
    priority: 'low' | 'normal' | 'high';
    dismissible: boolean;
    url?: string;
}

export interface Notification {
    id: string;
    type: string;
    notifiable_type: string;
    notifiable_id: number;
    data: NotificationData;
    read_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    links: {
        url: string | null;
        label: string;
        active: boolean;
    }[];
    current_page: number;
    from: number;
    last_page: number;
    path: string;
    per_page: number;
    to: number;
    total: number;
}

