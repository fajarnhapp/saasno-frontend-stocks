type Json = string | number | boolean | null | Json[] | { [key: string]: Json };

function parseJson(value: string): Json | undefined {
    try {
        return JSON.parse(value);
    } catch {
        return undefined;
    }
}

function isContainer(value: Json | undefined): value is Json[] | { [key: string]: Json } {
    return typeof value === 'object' && value !== null;
}

function entriesOf(value: Json[] | { [key: string]: Json }): [string, Json][] {
    return Array.isArray(value)
        ? value.map((item, i) => [`[${i}]`, item])
        : Object.entries(value);
}

function formatPrimitive(value: Json): string {
    if (value === null) return 'null';
    return String(value);
}

function PrettyJson({ value }: { value: Json }) {
    return (
        <pre className="mt-1 overflow-x-auto rounded-md bg-gray-900 p-3 font-mono text-xs leading-relaxed text-gray-100">
            {JSON.stringify(value, null, 2)}
        </pre>
    );
}

// Renders an object as a bulleted list: "• key = value", nested objects as "• key" with their entries indented below
function BulletEntries({ value, nested }: { value: Json[] | { [key: string]: Json }; nested: boolean }) {
    const entries = entriesOf(value);

    return (
        <ul className={nested ? 'ml-5 mt-1 space-y-1' : 'space-y-1'}>
            {entries.map(([key, child]) => {
                // A string that itself holds JSON is shown as pretty JSON instead of being expanded
                const embedded = typeof child === 'string' ? parseJson(child) : undefined;

                return (
                    <li key={key} className="font-mono text-xs text-gray-700">
                        <span
                            aria-hidden
                            className={`mr-2 inline-block h-1.5 w-1.5 -translate-y-px rounded-full align-middle ${nested ? 'border border-brand-400' : 'bg-brand-500'}`}
                        />
                        <span className="font-semibold text-gray-800">{key}</span>
                        {isContainer(child) && entriesOf(child).length > 0 ? (
                            <BulletEntries value={child} nested />
                        ) : isContainer(embedded) ? (
                            <PrettyJson value={embedded} />
                        ) : (
                            <>
                                <span className="mx-1.5 text-gray-400">=</span>
                                <span className="break-all">
                                    {isContainer(child) ? JSON.stringify(child) : formatPrimitive(child)}
                                </span>
                            </>
                        )}
                    </li>
                );
            })}
        </ul>
    );
}

export default function RequestBodyView({ body }: { body?: string | null }) {
    if (!body) return <span className="text-sm text-gray-400">-</span>;

    const parsed = parseJson(body);
    if (!isContainer(parsed)) {
        return <pre className="whitespace-pre-wrap break-all font-mono text-xs text-gray-700">{body}</pre>;
    }
    if (entriesOf(parsed).length === 0) {
        return <span className="font-mono text-xs text-gray-500">{body}</span>;
    }

    return <BulletEntries value={parsed} nested={false} />;
}
