export interface Login {
    id: string,
    userId: string,
    username: string,
    roles: string[],
    registered: string,
    modificated: string,
    twoFactorPending?: boolean,
    passwordChangeRequired?: boolean,
    twoFactorSetupRequired?: boolean
}