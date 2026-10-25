interface PendingTagProps {
    type: 'add' | 'remove';
}

// Marks an item whose assignment changed in the draft but has not been saved yet
export default function PendingTag({ type }: PendingTagProps) {
    return type === 'add' ? (
        <span className="ml-2 rounded bg-green-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-green-700">New</span>
    ) : (
        <span className="ml-2 rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-red-700">Removed</span>
    );
}
