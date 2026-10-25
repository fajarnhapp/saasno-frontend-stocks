export const getAddressTypeLabel = (type: string): string => {
    const map: Record<string, string> = {
        HOME: 'Home',
        OFFICE: 'Office',
        CARD: 'ID Card Address',
        BILLING: 'Billing Address',
        SHIPPING: 'Shipping Address',
        DOMICILE: 'Domicile Address'
    };

    return map[type] || type;
};
