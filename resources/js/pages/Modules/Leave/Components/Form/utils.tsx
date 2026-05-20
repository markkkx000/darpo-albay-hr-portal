import React from 'react';

export const Required = () => <span className="text-destructive ml-1">*</span>;

export const formatDateForInput = (dateString: string | null | undefined): string => {
    if (!dateString) {
        return '';
    }

    const date = new Date(dateString);

    return date.toLocaleDateString('en-CA', { timeZone: 'Asia/Manila' });
};

export const parseLocalDate = (dateString: string): Date | null => {
    if (!dateString) {
        return null;
    }

    const [y, m, d] = dateString.split('-').map(Number);

    return new Date(y, m - 1, d);
};
