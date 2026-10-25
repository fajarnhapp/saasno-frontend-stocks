export interface ApiToken {
    id?: string;
    name?: string;
    prefix?: string;
    expiresAt?: string;
    lastUsedAt?: string | null;
    registered?: string;
    // Only in the answer to the creation.
    token?: string;
}
