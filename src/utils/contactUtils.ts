export const getContactTypeLabel = (type: string): string => {
    const map: Record<string, string> = {
        EMERGENCY_PHONE: 'Kontak Darurat',
        PHONE: 'Telepon',
        EMAIL: 'Email',
        WHATSAPP: 'WhatsApp',
        FACEBOOK: 'Facebook',
        INSTAGRAM: 'Instagram',
        X: 'X',
        TWITTER: 'Twitter',
        YOUTUBE: 'YouTube',
        LINKEDIN: 'LinkedIn',
        TELEGRAM: 'Telegram',
    };

    return map[type] || type;
};
