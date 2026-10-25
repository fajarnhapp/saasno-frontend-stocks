import { Option } from "@/type/option";

type BadgeVariant = 'red' | 'green' | 'orange' | 'blue' | 'gray';

export const getEducationOption = (): Option[] => {
    return Object.entries(educationLabel).map(([value, label]) => ({ value, label }));
};

export const educationVariant: Record<string, BadgeVariant> = {
    '0': 'orange',
    '1': 'orange',
    '2': 'orange',
    '3': 'blue',
    '4': 'blue',
    '5': 'blue',
    '6': 'blue',
    '7': 'green',
    '8': 'green',
    '9': 'red',
};

export const getEducationVariant = (status?: string | number): BadgeVariant => {
    if (status === undefined || status === null || status === '') return 'gray';
    return educationVariant[String(status)] || 'gray';
};

export const educationLabel: Record<string, string> = {
    '0': 'TK/Paud',
    '1': 'SD',
    '2': 'SMP',
    '3': 'SMA/SMK',
    '4': 'D1',
    '5': 'D2',
    '6': 'D3',
    '7': 'S1/D4',
    '8': 'S2',
    '9': 'S3',

};

export const getEducationLabel = (status?: string | number): string => {
    if (status === undefined || status === null || status === '') return '-';
    return educationLabel[String(status)] || String(status);
};
