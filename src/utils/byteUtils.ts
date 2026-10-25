// 0 B, 1.5 KB, 3.2 MB ... (1 KB = 1024 bytes)
export function formatBytes(bytes: number): string {
    if (!Number.isFinite(bytes) || bytes <= 0) {
        return '0 B';
    }
    const units: string[] = ['B', 'KB', 'MB', 'GB', 'TB'];
    const index: number = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
    const value: number = bytes / Math.pow(1024, index);
    return `${index === 0 ? value : value.toFixed(value >= 10 ? 0 : 1)} ${units[index]}`;
}
