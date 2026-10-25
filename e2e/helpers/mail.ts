import fs from 'node:fs';
import path from 'node:path';
import { MAIL_DIR } from './env';

export interface Mail {
    to: string;
    subject: string;
    text: string;
    file: string;
}

// Quoted-printable ("=3D" is "=", a "=" at the end of a line joins it with the next one).
function decodeQuotedPrintable(text: string): string {
    return text
        .replace(/=\r?\n/g, '')
        .replace(/=([0-9A-F]{2})/gi, (_, hex: string) => String.fromCharCode(parseInt(hex, 16)));
}

function parse(file: string): Mail {
    const raw: string = fs.readFileSync(file, 'utf8');
    const header = (name: string): string => new RegExp(`^${name}:\\s*(.*)$`, 'im').exec(raw)?.[1].trim() ?? '';
    // The plain-text part: from its blank line to the next MIME boundary.
    const plain: RegExpExecArray | null = /Content-Type: text\/plain[^\n]*\n(?:[^\n]+\n)*?\r?\n([\s\S]*?)(?:\r?\n--[^\n]+)/i.exec(raw);
    const encoded: boolean = /Content-Transfer-Encoding: quoted-printable/i.test(plain ? raw.slice(raw.indexOf(plain[0]), raw.indexOf(plain[0]) + plain[0].length) : '');
    const body: string = plain ? plain[1] : raw;
    return { to: header('To'), subject: header('Subject'), text: encoded ? decodeQuotedPrintable(body) : body, file };
}

export function clearMail(): void {
    fs.mkdirSync(MAIL_DIR, { recursive: true });
    for (const name of fs.readdirSync(MAIL_DIR)) fs.rmSync(path.join(MAIL_DIR, name), { force: true });
}

// Waits for an email to the given address (the sink writes one file per email) and returns it.
export async function waitForMail(to: string, timeoutMs = 20_000): Promise<Mail> {
    const deadline: number = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
        const files: string[] = fs.existsSync(MAIL_DIR) ? fs.readdirSync(MAIL_DIR).filter(f => f.endsWith('.eml')).sort() : [];
        for (const name of files.reverse()) {
            const mail: Mail = parse(path.join(MAIL_DIR, name));
            if (mail.to.toLowerCase().includes(to.toLowerCase())) return mail;
        }
        await new Promise(resolve => setTimeout(resolve, 300));
    }
    throw new Error(`No email to ${to} within ${timeoutMs} ms`);
}

// The first link in the email.
export function firstLink(mail: Mail): string {
    const match: RegExpExecArray | null = /https?:\/\/\S+/.exec(mail.text);
    if (!match) throw new Error(`No link in the email "${mail.subject}"`);
    return match[0];
}
