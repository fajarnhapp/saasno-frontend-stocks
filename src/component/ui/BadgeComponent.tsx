type BadgeVariant =
    | 'red'
    | 'green'
    | 'orange'
    | 'blue'
    | 'gray'
    | 'yellow';

interface BadgeProps {
    children: React.ReactNode;
    variant?: BadgeVariant;
    className?: string;
}

const badgeVariants: Record<BadgeVariant, string> = {
    red: 'bg-red-100 text-red-700 border-red-200',
    green: 'bg-green-100 text-green-700 border-green-200',
    orange: 'bg-orange-100 text-orange-700 border-orange-200',
    blue: 'bg-blue-100 text-blue-700 border-blue-200',
    gray: 'bg-gray-100 text-gray-700 border-gray-200',
    yellow: 'bg-yellow-100 text-yellow-700 border-yellow-200',
};

const base: string = 'inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-medium';

export default function BadgeComponent({
    children,
    variant = 'red',
    className,
}: BadgeProps) {
    return (
        <span
            className={`${base} ${badgeVariants[variant]} ${className}`}>
            {children}
        </span>
    );
}
