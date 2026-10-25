'use client';

import { useEffect, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { useCsrf } from '@/context/CsrfContext';
import { useLanguage } from '@/context/LanguageContext';
import { useLoading } from '@/context/LoadingCircleContext';
import { useModal } from '@/context/ModalContext';
import { DeletionRequest, handleDeletionRequest, Policy, PolicyAdmin, publishPolicy, readDeletionRequests, readPolicyAdmin } from '@/service/privacyService';
import { ResponseApi } from '@/type/common/ResponseApi';
import { formatDate } from '@/utils/formatterUtils';
import { API_MSG_SUCCESS, handleResponseApi } from '@/utils/responseApiUtils';
import BadgeComponent from '../ui/BadgeComponent';
import ButtonComponent from '../ui/ButtonComponent';
import LoadingContent from '../ui/LoadingContent';
import { TableBody, TableCell, TableComponent, TableHeader, TableRow } from '../ui/TableComponent';
import PolicyView from './PolicyView';

const STATUS_VARIANT: Record<string, 'orange' | 'green' | 'gray'> = { PENDING: 'orange', DONE: 'green', REJECTED: 'gray' };

// The privacy policy text (every change is a new version that everyone is asked to read) and the requests to delete an account.
export default function PrivacyAdmin() {
    const { t } = useLanguage();
    const { csrf, setCsrf } = useCsrf();
    const { handleLoading } = useLoading();
    const { showConfirm, showModal, contentModalSuccess, contentModalError } = useModal();
    const [admin, setAdmin] = useState<PolicyAdmin | null>(null);
    const [requests, setRequests] = useState<DeletionRequest[]>([]);
    // The policy in both languages; the tab says which one is being edited.
    const [draftEn, setDraftEn] = useState<string>('');
    const [draftId, setDraftId] = useState<string>('');
    const [tab, setTab] = useState<'en' | 'id'>('en');
    const [preview, setPreview] = useState<boolean>(false);
    const [version, setVersion] = useState<number>(0);

    useEffect(() => {
        const load = async () => {
            const res: Response = await readPolicyAdmin(setCsrf);
            const data: ResponseApi<PolicyAdmin> = await handleResponseApi<ResponseApi<PolicyAdmin>>(res);
            if (data.data) {
                setAdmin(data.data);
                setDraftEn(data.data.contentEn);
                setDraftId(data.data.contentId);
            }
            const reqRes: Response = await readDeletionRequests(setCsrf);
            const reqData: ResponseApi<DeletionRequest[]> = await handleResponseApi<ResponseApi<DeletionRequest[]>>(reqRes);
            setRequests(reqData.data || []);
        };
        load();
    }, [version, setCsrf]);

    if (!admin) {
        return <LoadingContent />;
    }

    const next: number = admin.builtIn ? 1 : admin.version + 1;
    const draft: string = tab === 'en' ? draftEn : draftId;
    const setDraft = (text: string) => (tab === 'en' ? setDraftEn(text) : setDraftId(text));
    const unchanged: boolean = draftEn.trim() === admin.contentEn.trim() && draftId.trim() === admin.contentId.trim();
    const onlyOne: boolean = draftEn.trim() === '' || draftId.trim() === '';

    const publish = () => showConfirm(
        <div className="flex flex-col gap-2">
            <h3 className="mb-2 text-lg font-semibold">{t('Publish the policy')}</h3>
            <p className="mb-4">{t('Publish this text as version {version}? Every user is asked to read it again.', { version: next })}</p>
        </div>,
        async () => {
            await handleLoading(async () => {
                const res: Response = await publishPolicy(draftEn, draftId, csrf, setCsrf);
                const data: ResponseApi<Policy> = await handleResponseApi<ResponseApi<Policy>>(res);
                if (data.message === API_MSG_SUCCESS) {
                    showModal(contentModalSuccess(t('The policy is published.')));
                    setVersion(v => v + 1);
                } else {
                    showModal(contentModalError(data.message || t('Failed to publish the policy.')));
                }
            });
        }, 'Yes', 'Cancel');

    const handle = (request: DeletionRequest, action: 'APPROVE' | 'REJECT') => showConfirm(
        <div className="flex flex-col gap-2">
            <h3 className="mb-2 text-lg font-semibold">{action === 'APPROVE' ? t('Approve the request') : t('Reject the request')}</h3>
            <p className="mb-4">
                {action === 'APPROVE'
                    ? t('Move the account of {name} to the trash? They cannot sign in any more.', { name: request.username })
                    : t('Keep the account of {name} and tell them the request was not approved?', { name: request.username })}
            </p>
        </div>,
        async () => {
            await handleLoading(async () => {
                const res: Response = await handleDeletionRequest(request.id, action, csrf, setCsrf);
                const data: ResponseApi<unknown> = await handleResponseApi<ResponseApi<unknown>>(res);
                if (data.message === API_MSG_SUCCESS) {
                    setVersion(v => v + 1);
                } else {
                    showModal(contentModalError(data.message || t('The request could not be handled.')));
                }
            });
        }, 'Yes', 'Cancel');

    return (
        <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-3">
            <div className="space-y-4 rounded-2xl border border-gray-200 bg-white p-5 xl:col-span-2">
                <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-base font-semibold">{t('Privacy policy')}</h3>
                    <BadgeComponent variant={admin.builtIn ? 'gray' : 'green'}>
                        {admin.builtIn ? t('Built-in text, not published yet') : t('Version {version}', { version: admin.version })}
                    </BadgeComponent>
                    <a href="/privacy" target="_blank" rel="noreferrer" className="ml-auto inline-flex items-center gap-1 text-sm text-brand-600 hover:underline">
                        {t('Open the public page')} <ExternalLink size={14} />
                    </a>
                </div>
                {admin.builtIn && (
                    <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
                        {t('This is the text that comes with the application. Fill in the parts in [square brackets], have it reviewed, then publish it. Until then nobody is asked to read it.')}
                    </p>
                )}
                <div role="tablist" className="flex gap-2">
                    {([['en', 'English', draftEn], ['id', 'Bahasa Indonesia', draftId]] as const).map(([code, label, text]) => (
                        <button key={code} type="button" role="tab" aria-selected={tab === code} onClick={() => setTab(code)}
                            className={`rounded-lg border px-3 py-1.5 text-sm cursor-pointer ${tab === code ? 'border-brand-500 bg-brand-50 font-semibold text-brand-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                            {label}{text.trim() === '' ? ` (${t('empty')})` : ''}
                        </button>
                    ))}
                </div>
                <p className="text-xs text-gray-500">
                    {t('Marks: "# " title, "## " heading, "- " list item, a blank line between paragraphs.')}
                </p>
                <textarea
                    aria-label={t('Privacy policy')}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    rows={22}
                    maxLength={50000}
                    className="w-full rounded-lg border border-gray-200 px-4 py-3 font-mono text-sm outline-none transition focus:ring-2 focus:ring-brand-500"
                />
                <div className="flex flex-wrap items-center gap-3">
                    <ButtonComponent type="button" className="w-auto!" disabled={(draftEn.trim() === '' && draftId.trim() === '') || unchanged} onClick={publish}>
                        {t('Publish as version {version}', { version: next })}
                    </ButtonComponent>
                    <ButtonComponent type="button" variant="secondary" className="w-auto!" onClick={() => setPreview(!preview)}>
                        {preview ? t('Hide preview') : t('Preview')}
                    </ButtonComponent>
                </div>
                {onlyOne && (
                    <p className="text-xs text-gray-500">{t('Only one language is filled in: the public page shows it to everyone and has no choice of language.')}</p>
                )}
                {preview && <div className="rounded-lg border border-gray-100 bg-gray-50 p-5"><PolicyView content={draft} /></div>}
            </div>

            <div className="space-y-5">
                <div className="rounded-2xl border border-gray-200 bg-white p-5">
                    <h3 className="mb-3 text-base font-semibold">{t('Published versions')}</h3>
                    {admin.versions.length === 0 && <p className="text-sm text-gray-400">{t('None yet.')}</p>}
                    <ul className="divide-y divide-gray-100 text-sm">
                        {admin.versions.map(v => (
                            <li key={v.version} className="flex justify-between py-2">
                                <span className="font-medium">{t('Version {version}', { version: v.version })}</span>
                                <span className="text-gray-500">{v.publishedAt ? formatDate(v.publishedAt, 'DD/MM/YYYY HH:mm') : ''} · {v.publishedBy || '-'}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-5">
                    <h3 className="mb-3 text-base font-semibold">{t('Account deletion requests')}</h3>
                    {requests.length === 0 && <p className="text-sm text-gray-400">{t('No request.')}</p>}
                    {requests.length > 0 && (
                        <div className="overflow-x-auto">
                            <TableComponent>
                                <TableHeader>
                                    <TableRow>
                                        <TableCell isHeader>{t('Username')}</TableCell>
                                        <TableCell isHeader>{t('Status')}</TableCell>
                                        <TableCell isHeader>{t('Action')}</TableCell>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {requests.map(request => (
                                        <TableRow key={request.id}>
                                            <TableCell>
                                                {request.username}
                                                <span className="block text-xs text-gray-400">{request.requestedAt ? formatDate(request.requestedAt, 'DD/MM/YYYY HH:mm') : ''}</span>
                                            </TableCell>
                                            <TableCell><BadgeComponent variant={STATUS_VARIANT[request.status] || 'gray'}>{request.status}</BadgeComponent></TableCell>
                                            <TableCell>
                                                {request.status === 'PENDING' && (
                                                    <div className="flex gap-2">
                                                        <ButtonComponent type="button" size="sm" className="w-auto!" onClick={() => handle(request, 'APPROVE')}>{t('Approve')}</ButtonComponent>
                                                        <ButtonComponent type="button" size="sm" variant="secondary" className="w-auto!" onClick={() => handle(request, 'REJECT')}>{t('Reject')}</ButtonComponent>
                                                    </div>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </TableComponent>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
