import type { PasswordPolicy } from '../type/password';

// Used while the policy cannot be loaded; the same defaults as the backend.
export const DEFAULT_PASSWORD_POLICY: PasswordPolicy = { minLength: 8, requireComplexity: true };

export const MAX_PASSWORD_LENGTH = 128;

// The backend only receives the SHA-256 of a password, so this is where length and complexity are checked (before hashing).
// Returns the problem to show, or null when the password is acceptable.
export function validatePassword(password: string, policy: PasswordPolicy = DEFAULT_PASSWORD_POLICY): string | null {
    if (password.length < policy.minLength) {
        return `Password must be at least ${policy.minLength} characters`;
    }
    if (password.length > MAX_PASSWORD_LENGTH) {
        return `Password must be at most ${MAX_PASSWORD_LENGTH} characters`;
    }
    if (policy.requireComplexity && !(/[a-z]/.test(password) && /[A-Z]/.test(password) && /\d/.test(password))) {
        return 'Password must contain an upper case letter, a lower case letter and a digit';
    }
    return null;
}

export function describePasswordPolicy(policy: PasswordPolicy = DEFAULT_PASSWORD_POLICY): string {
    return policy.requireComplexity
        ? `At least ${policy.minLength} characters, with upper case, lower case and a digit`
        : `At least ${policy.minLength} characters`;
}
