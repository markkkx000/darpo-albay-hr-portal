export const getDetailsOptions = (name: string): string[] => {
    if (!name) {
        return [];
    }

    if (
        name.includes('vacation') ||
        name.includes('mandatory') ||
        name.includes('special privilege')
    ) {
        return ['Within the Philippines', 'Abroad'];
    }

    if (name.includes('sick')) {
        return ['In Hospital', 'Out Patient'];
    }

    if (name.includes('women')) {
        return ['Illness'];
    }

    if (name.includes('study')) {
        return [
            "Completion of Master's Degree",
            'BAR/Board Examination Review',
            'Others',
        ];
    }

    if (
        name.includes('maternity') ||
        name.includes('paternity') ||
        name.includes('vawc') ||
        name.includes('parent')
    ) {
        return ['N/A'];
    }

    return ['Monetization of Leave Credits', 'Terminal Leave', 'Others'];
};

export const getSupportingDocsOptions = (
    name: string,
    daysRequested: string | number,
): string[] => {
    const docs: string[] = [];

    if (name.includes('sick')) {
        docs.push('Medical Certificate', 'Affidavit');
    }

    if (name.includes('maternity') || name.includes('paternity')) {
        docs.push(
            'Proof of Pregnancy/Delivery',
            'Marriage Contract',
            'Notice of Allocation (CS Form 6a)',
        );
    }

    if (name.includes('solo parent')) {
        docs.push('Solo Parent Identification Card', 'Birth Certificate');
    }

    if (name.includes('women')) {
        docs.push('Medical Certificate (Gynecological Surgery)');
    }

    if (name.includes('vawc')) {
        docs.push('Protection Order', 'Police Report');
    }

    if (name.includes('study') || name.includes('rehabilitation')) {
        docs.push('Contract', 'Incident/Police Report', 'Written Concurrence');
    }

    const days =
        typeof daysRequested === 'string'
            ? parseFloat(daysRequested)
            : daysRequested;

    if (!isNaN(days) && days >= 30) {
        docs.push('Clearance Form (CS Form 7)');
    }

    return [...new Set(docs)]; // Unique docs
};

export const getDetailsParts = (detailsString: string) => {
    if (!detailsString) {
        return { category: '', specify: '' };
    }

    const parts = detailsString.split(': ');

    if (parts.length > 1) {
        return { category: parts[0], specify: parts.slice(1).join(': ') };
    }

    return { category: detailsString, specify: '' };
};
