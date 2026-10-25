import { Menu } from "../menu";

export interface UserRole {
    id?: string;
    name?: string;
    menus?: Menu[];
    modificated?: string;
    registered?: string;
}

export interface Contact {
    id?: string;
    type?: 'EMAIL' | 'PHONE';
    value?: string;
    label?: 'PERSONAL' | 'WORK' | 'OTHER';
    primary?: boolean;
    verifiedAt?: string;
}

export interface Person {
    id?: string;
    fullName?: string;
    nickname?: string;
    birthPlace?: string;
    birthDate?: string;
    gender?: string;
    religion?: string;
    contacts?: Contact[];
}

export interface User {
    id?: string;
    username?: string;
    fullName?: string;
    email?: string;
    person?: Person;
    activationSent?: boolean;
    deletedAt?: string;
    deletedBy?: string;
    roles?: UserRole[];
    status?: string;
    secure?: boolean;
    twoFactorAuth?: boolean;
    passwordChangeRequired?: boolean;
    twoFactorRequired?: boolean;
    twoFactorSetupRequired?: boolean;
    avatarVersion?: number;
    recoveryCodesLeft?: number;
    modificated?: string;
    registered?: string;
}
