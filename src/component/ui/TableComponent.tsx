import React, { ReactNode } from "react";

interface TableProps {
    children: ReactNode;
    className?: string;
}

interface TableHeaderProps {
    children: ReactNode;
    className?: string;
}

interface TableBodyProps {
    children: ReactNode;
    className?: string;
}

interface TableRowProps {
    children: ReactNode;
    className?: string;
    onClick?: () => void;
}

interface TableCellProps {
    children: ReactNode;
    isHeader?: boolean;
    className?: string;
    colSpan?: number;
    onClick?: React.MouseEventHandler<HTMLTableCellElement>;
}

// TableComponent dengan dukungan forwardRef untuk elemen HTMLTableElement
const TableComponent = React.forwardRef<HTMLTableElement, TableProps>(
    ({ children, className }, ref) => {
        return (
            <table
                ref={ref}
                className={`min-w-full table-auto text-left text-sm text-gray-700 ${className}`}
            >
                {children}
            </table>
        );
    }
);

// Memberikan displayName agar mempermudah debugging di React DevTools
TableComponent.displayName = "TableComponent";

// TableHeader Component
const TableHeader: React.FC<TableHeaderProps> = ({ children, className }) => {
    return (
        <thead className={`border-b border-brand-100 bg-brand-50/70 text-xs font-semibold uppercase tracking-wide text-brand-700 ${className}`}>
            {children}
        </thead>
    );
};

// TableBody Component
const TableBody: React.FC<TableBodyProps> = ({ children, className }) => {
    return <tbody className={`divide-y divide-gray-100 ${className}`}>{children}</tbody>;
};

// TableRow Component
const TableRow: React.FC<TableRowProps> = ({ children, className, onClick }) => {
    return (
        <tr
            className={`transition-colors hover:bg-brand-50/60 ${onClick ? 'cursor-pointer' : ''} ${className}`}
            onClick={onClick}
        >
            {children}
        </tr>
    );
};

// TableCell Component
const TableCell: React.FC<TableCellProps> = ({
    children,
    isHeader = false,
    className,
    colSpan,
    onClick
}) => {
    const CellTag = isHeader ? "th" : "td";
    return (
        <CellTag
            className={`whitespace-nowrap px-6 ${isHeader ? 'py-2' : 'py-2.5'} ${className}`}
            colSpan={colSpan}
            onClick={onClick}
        >
            {children}
        </CellTag>
    );
};

export { TableComponent, TableHeader, TableBody, TableRow, TableCell };