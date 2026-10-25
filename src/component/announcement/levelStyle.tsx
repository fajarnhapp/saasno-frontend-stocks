import { AlertTriangle, Info, Megaphone } from 'lucide-react';

// How an announcement looks by level; shared by the banner above the pages and the list on the dashboard.
export const LEVEL_STYLE: Record<string, string> = {
    INFO: 'bg-sky-50 text-sky-800 border-sky-200',
    WARNING: 'bg-amber-50 text-amber-800 border-amber-200',
    CRITICAL: 'bg-red-50 text-red-800 border-red-200',
};

export function LevelIcon({ level, size = 16, className = '' }: { level?: string; size?: number; className?: string }) {
    if (level === 'CRITICAL') return <AlertTriangle size={size} className={className} />;
    if (level === 'WARNING') return <Megaphone size={size} className={className} />;
    return <Info size={size} className={className} />;
}
