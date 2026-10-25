import { parsePolicy } from '@/utils/policyText';

// The policy text as a readable page. The text is shown as text, never as HTML.
export default function PolicyView({ content }: { content: string }) {
    return (
        <article className="space-y-4 text-sm leading-relaxed text-gray-700">
            {parsePolicy(content).map((block, index) => {
                switch (block.kind) {
                    case 'title':
                        return <h1 key={index} className="text-2xl font-bold text-gray-900">{block.text}</h1>;
                    case 'heading':
                        return <h2 key={index} className="pt-2 text-base font-semibold text-gray-900">{block.text}</h2>;
                    case 'list':
                        return (
                            <ul key={index} className="list-disc space-y-1 pl-5">
                                {block.items.map((item, i) => <li key={i}>{item}</li>)}
                            </ul>
                        );
                    default:
                        return <p key={index}>{block.text}</p>;
                }
            })}
        </article>
    );
}
