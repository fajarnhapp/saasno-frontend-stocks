// Reading a CSV file in the browser (used to import users). Handles quotes, escaped quotes, a BOM, CRLF line ends and either a comma or a
// semicolon as separator (spreadsheet programs in some regions save with a semicolon).

export function parseCsv(text: string): string[][] {
    const source: string = text.replace(/^﻿/, '');
    const firstLine: string = source.split(/\r?\n/, 1)[0] ?? '';
    const delimiter: string = (firstLine.match(/;/g)?.length ?? 0) > (firstLine.match(/,/g)?.length ?? 0) ? ';' : ',';

    const rows: string[][] = [];
    let row: string[] = [];
    let cell: string = '';
    let quoted: boolean = false;

    for (let i = 0; i < source.length; i++) {
        const char: string = source[i];
        if (quoted) {
            if (char === '"' && source[i + 1] === '"') {
                cell += '"';
                i++;
            } else if (char === '"') {
                quoted = false;
            } else {
                cell += char;
            }
        } else if (char === '"') {
            quoted = true;
        } else if (char === delimiter) {
            row.push(cell);
            cell = '';
        } else if (char === '\n' || char === '\r') {
            if (char === '\r' && source[i + 1] === '\n') i++;
            row.push(cell);
            rows.push(row);
            row = [];
            cell = '';
        } else {
            cell += char;
        }
    }
    if (cell !== '' || row.length > 0) {
        row.push(cell);
        rows.push(row);
    }
    // Lines with nothing in them are dropped.
    return rows.filter(r => r.some(c => c.trim() !== ''));
}

export interface ImportRow {
    username: string;
    fullName: string;
    email: string;
    role: string;
}

const HEADER_NAMES: Record<keyof ImportRow, string[]> = {
    username: ['username', 'user name', 'user'],
    fullName: ['fullname', 'full name', 'name'],
    email: ['email', 'e-mail'],
    role: ['role'],
};

// The users in a CSV file with a header line (username, full name, email, role in any order). Returns an error text when a column is missing.
export function usersFromCsv(text: string): { rows?: ImportRow[]; error?: string } {
    const table: string[][] = parseCsv(text);
    if (table.length < 2) {
        return { error: 'The file needs a header line and at least one user.' };
    }
    const header: string[] = table[0].map(h => h.trim().toLowerCase());
    const index = {} as Record<keyof ImportRow, number>;
    for (const key of Object.keys(HEADER_NAMES) as (keyof ImportRow)[]) {
        index[key] = header.findIndex(h => HEADER_NAMES[key].includes(h));
        if (index[key] < 0) {
            return { error: `The header line has no "${key}" column.` };
        }
    }
    const rows: ImportRow[] = table.slice(1).map(cells => ({
        username: (cells[index.username] ?? '').trim(),
        fullName: (cells[index.fullName] ?? '').trim(),
        email: (cells[index.email] ?? '').trim(),
        role: (cells[index.role] ?? '').trim(),
    }));
    return { rows };
}

export const CSV_TEMPLATE: string = 'username,fullName,email,role\nbudi.santoso,Budi Santoso,budi@example.com,ADMINISTRASI\n';
