interface MethodBadgeProps {
    method?: string;
}

// Postman HTTP method colors
const methodColors: Record<string, string> = {
    GET: 'bg-[#0CBB52]/10 text-[#0CBB52] border-[#0CBB52]/30',
    POST: 'bg-[#FFB400]/10 text-[#D99A00] border-[#FFB400]/40',
    PUT: 'bg-[#097BED]/10 text-[#097BED] border-[#097BED]/30',
    PATCH: 'bg-[#623497]/10 text-[#623497] border-[#623497]/30',
    DELETE: 'bg-[#EB2013]/10 text-[#EB2013] border-[#EB2013]/30',
    HEAD: 'bg-[#0CBB52]/10 text-[#0CBB52] border-[#0CBB52]/30',
    OPTIONS: 'bg-[#F15EB0]/10 text-[#F15EB0] border-[#F15EB0]/30',
};

const fallback = 'bg-gray-100 text-gray-700 border-gray-200';

export default function MethodBadge({ method }: MethodBadgeProps) {
    const upper = (method || '').toUpperCase();
    return (
        <span className={`inline-flex min-w-[64px] justify-center rounded-md border px-2 py-0.5 text-xs font-bold tracking-wide ${methodColors[upper] || fallback}`}>
            {upper || '-'}
        </span>
    );
}
