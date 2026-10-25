'use client';

import { useRef, useState } from 'react';
import { Download, FileUp } from 'lucide-react';
import { useCsrf } from '@/context/CsrfContext';
import { useT } from '@/context/LanguageContext';
import { useLoading } from '@/context/LoadingCircleContext';
import { useModal } from '@/context/ModalContext';
import { ImportResult, importUsers } from '@/service/userService';
import { ResponseApi } from '@/type/common/ResponseApi';
import { CSV_TEMPLATE, ImportRow, usersFromCsv } from '@/utils/csvUtils';
import { API_MSG_SUCCESS, handleResponseApi } from '@/utils/responseApiUtils';
import BadgeComponent from '../ui/BadgeComponent';
import ButtonComponent from '../ui/ButtonComponent';
import { TableBody, TableCell, TableComponent, TableHeader, TableRow } from '../ui/TableComponent';

const MAX_ROWS = 200;
const MAX_FILE_BYTES = 512 * 1024;

// Creating many users from a CSV file: the file is read here in the browser, checked on the server without saving anything, and only then imported.
export default function UserImportPanel({ onDone }: { onDone: () => void }) {
    const t = useT();
    const { csrf, setCsrf } = useCsrf();
    const { handleLoading } = useLoading();
    const { showConfirm, showModal, contentModalSuccess, contentModalError } = useModal();
    const input = useRef<HTMLInputElement>(null);
    const [rows, setRows] = useState<ImportRow[] | null>(null);
    const [report, setReport] = useState<ImportResult | null>(null);
    const [problem, setProblem] = useState<string>('');

    const reset = () => {
        setRows(null);
        setReport(null);
        setProblem('');
        if (input.current) input.current.value = '';
    };

    const check = async (parsed: ImportRow[]) => {
        await handleLoading(async () => {
            const res: Response = await importUsers(parsed, true, csrf, setCsrf);
            const data: ResponseApi<ImportResult> = await handleResponseApi<ResponseApi<ImportResult>>(res);
            if (data.message === API_MSG_SUCCESS && data.data) {
                setReport(data.data);
            } else {
                setProblem(data.message || t('The file could not be checked.'));
            }
        });
    };

    const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file: File | undefined = e.target.files?.[0];
        reset();
        if (!file) return;
        if (file.size > MAX_FILE_BYTES) {
            setProblem(t('The file is too large.'));
            return;
        }
        const parsed = usersFromCsv(await file.text());
        if (!parsed.rows) {
            setProblem(t(parsed.error || 'The file could not be read.'));
            return;
        }
        if (parsed.rows.length > MAX_ROWS) {
            setProblem(t('At most {max} users at a time.', { max: MAX_ROWS }));
            return;
        }
        setRows(parsed.rows);
        await check(parsed.rows);
    };

    const start = () => showConfirm(
        <div className="flex flex-col gap-2">
            <h3 className="mb-2 text-lg font-semibold">{t('Import confirmation')}</h3>
            <p className="mb-4">{t('Create {count} users? Each one gets an email with a link to choose a password.', { count: report?.valid ?? 0 })}</p>
        </div>,
        async () => {
            await handleLoading(async () => {
                const res: Response = await importUsers(rows || [], false, csrf, setCsrf);
                const data: ResponseApi<ImportResult> = await handleResponseApi<ResponseApi<ImportResult>>(res);
                if (data.message === API_MSG_SUCCESS && data.data) {
                    setReport(data.data);
                    showModal(contentModalSuccess(t('{count} users created.', { count: data.data.created })));
                    onDone();
                } else {
                    showModal(contentModalError(data.message || t('The import failed.')));
                }
            });
        }, 'Yes', 'Cancel');

    const download = () => {
        const url: string = URL.createObjectURL(new Blob([CSV_TEMPLATE], { type: 'text/csv' }));
        const link: HTMLAnchorElement = document.createElement('a');
        link.href = url;
        link.download = 'users-template.csv';
        link.click();
        URL.revokeObjectURL(url);
    };

    const imported: boolean = !!report && !report.dryRun;

    return (
        <div className="mb-4 rounded-2xl border border-gray-200 bg-white px-5 py-6">
            <h3 className="mb-1 text-base font-semibold">{t('Import users from a CSV file')}</h3>
            <p className="mb-4 text-sm text-gray-500">{t('The first line holds the column names: username, fullName, email, role. The role is its id or its name.')}</p>
            <div className="flex flex-wrap items-center gap-3">
                <ButtonComponent type="button" variant="outline" className="w-auto! gap-1.5" onClick={() => input.current?.click()}>
                    <FileUp size={16} /> {t('Choose a file')}
                </ButtonComponent>
                <ButtonComponent type="button" variant="secondary" className="w-auto! gap-1.5" onClick={download}>
                    <Download size={16} /> {t('Download the template')}
                </ButtonComponent>
                <input ref={input} type="file" accept=".csv,text/csv" className="hidden" onChange={onFile} />
            </div>

            {problem && <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{problem}</p>}

            {report && (
                <div className="mt-4">
                    <p className="mb-2 text-sm text-gray-700">
                        {imported
                            ? t('{created} created, {invalid} not created.', { created: report.created, invalid: report.invalid })
                            : t('{valid} users can be imported, {invalid} have a problem.', { valid: report.valid, invalid: report.invalid })}
                    </p>
                    <div className="max-h-80 overflow-auto rounded-xl border border-gray-200">
                        <TableComponent>
                            <TableHeader>
                                <TableRow>
                                    <TableCell isHeader>{t('Line')}</TableCell>
                                    <TableCell isHeader>{t('Username')}</TableCell>
                                    <TableCell isHeader>{t('Result')}</TableCell>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {report.items.map(item => (
                                    <TableRow key={item.line}>
                                        <TableCell>{item.line}</TableCell>
                                        <TableCell>{item.username || '-'}</TableCell>
                                        <TableCell><BadgeComponent variant={item.ok ? 'green' : 'red'}>{t(item.message)}</BadgeComponent></TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </TableComponent>
                    </div>
                    <div className="mt-4 flex gap-3">
                        {!imported && <ButtonComponent type="button" className="w-auto!" disabled={report.valid === 0} onClick={start}>{t('Import {count} users', { count: report.valid })}</ButtonComponent>}
                        <ButtonComponent type="button" variant="secondary" className="w-auto!" onClick={reset}>{imported ? t('Import another file') : t('Cancel')}</ButtonComponent>
                    </div>
                </div>
            )}
        </div>
    );
}
