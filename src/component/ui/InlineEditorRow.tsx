import { ReactNode } from 'react';

interface Properties {
    colSpan: number;
    children: ReactNode;
}

// The edit form of a table row. The table scrolls sideways inside its card (the edit button is in the last column), so the form sticks to the
// left edge and takes the card's visible width (100cqw, from the @container wrapper) instead of moving with the columns.
export default function InlineEditorRow({ colSpan, children }: Properties) {
    return (
        <tr>
            <td colSpan={colSpan} className="bg-brand-50/40 p-0 align-top whitespace-normal">
                <div className="sticky left-0 box-border w-[100cqw] max-w-full p-3 sm:p-4">{children}</div>
            </td>
        </tr>
    );
}
