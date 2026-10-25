export const MAX_IMAGE_BYTES: number = 2 * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES: string[] = ['image/png', 'image/jpeg'];

// A quick check before uploading, to save a round trip. The backend checks the file's real content again; this is only a convenience.
export function validateImageFile(file: { size: number; type: string } | null | undefined): string | null {
    if (!file) {
        return 'Choose a picture first';
    }
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        return 'Only PNG and JPEG pictures are accepted';
    }
    if (file.size <= 0) {
        return 'The file is empty';
    }
    if (file.size > MAX_IMAGE_BYTES) {
        return 'The picture is too large (maximum 2 MB)';
    }
    return null;
}
