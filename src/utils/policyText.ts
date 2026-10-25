// The privacy policy is plain text with a few marks (it is never read as HTML, so nothing in it can run):
//   "# title", "## heading", "- list item", and a blank line between paragraphs.

export type PolicyBlock =
    | { kind: 'title'; text: string }
    | { kind: 'heading'; text: string }
    | { kind: 'paragraph'; text: string }
    | { kind: 'list'; items: string[] };

export function parsePolicy(source: string): PolicyBlock[] {
    const blocks: PolicyBlock[] = [];
    let paragraph: string[] = [];
    let list: string[] = [];

    const flush = () => {
        if (paragraph.length) blocks.push({ kind: 'paragraph', text: paragraph.join(' ') });
        if (list.length) blocks.push({ kind: 'list', items: list });
        paragraph = [];
        list = [];
    };

    for (const raw of source.replace(/\r\n/g, '\n').split('\n')) {
        const line: string = raw.trim();
        if (line === '') {
            flush();
        } else if (line.startsWith('## ')) {
            flush();
            blocks.push({ kind: 'heading', text: line.slice(3).trim() });
        } else if (line.startsWith('# ')) {
            flush();
            blocks.push({ kind: 'title', text: line.slice(2).trim() });
        } else if (line.startsWith('- ')) {
            if (paragraph.length) {
                blocks.push({ kind: 'paragraph', text: paragraph.join(' ') });
                paragraph = [];
            }
            list.push(line.slice(2).trim());
        } else {
            if (list.length) {
                blocks.push({ kind: 'list', items: list });
                list = [];
            }
            paragraph.push(line);
        }
    }
    flush();
    return blocks;
}
