function isSame(a: unknown, b: unknown): boolean {
    return JSON.stringify(a) === JSON.stringify(b);
}

// Fields of `updated` that differ from `original`, plus the `keep` fields (the record key by
// default) so the backend knows which row to update. Backend update() treats missing fields as
// "unchanged", so this is enough for a partial edit.
export function changedFields<T extends object>(
    original: T,
    updated: T,
    keep: (keyof T)[] = ['id' as keyof T]
): Partial<T> {
    const result: Partial<T> = {};
    (Object.keys(updated) as (keyof T)[]).forEach((key) => {
        if (!isSame(original[key], updated[key])) {
            result[key] = updated[key];
        }
    });
    keep.forEach((key) => {
        result[key] = updated[key];
    });
    return result;
}

export function hasChanges<T extends object>(original: T, updated: T): boolean {
    return (Object.keys(updated) as (keyof T)[]).some((key) => !isSame(original[key], updated[key]));
}
