import React from 'react';

export const Required = () => <span className="ml-1 text-destructive">*</span>;

export const parseLocalDate = (dateString: string): Date | null => {
    if (!dateString) {
        return null;
    }

    const [y, m, d] = dateString.split('-').map(Number);

    return new Date(y, m - 1, d);
};
