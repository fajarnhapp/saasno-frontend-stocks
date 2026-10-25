'use client';

import { useEffect, useState } from 'react';
import { ChevronDown, Mail, RotateCcw } from 'lucide-react';
import { useCsrf } from '@/context/CsrfContext';
import { useLoading } from '@/context/LoadingCircleContext';
import { useModal } from '@/context/ModalContext';
import { readEmailTemplates, resetEmailTemplate, updateEmailTemplate } from '@/service/emailTemplateService';
import { ResponseApi } from '@/type/common/ResponseApi';
import { EmailTemplate } from '@/type/email-template';
import { API_MSG_SUCCESS, handleResponseApi } from '@/utils/responseApiUtils';
import BadgeComponent from '../ui/BadgeComponent';
import ButtonComponent from '../ui/ButtonComponent';
import InputComponent from '../ui/InputComponent';
import LoadingContent from '../ui/LoadingContent';
import { useT } from '@/context/LanguageContext';

const areaClass = 'w-full rounded-lg border border-gray-200 px-4 py-2 outline-none transition focus:ring-2 focus:ring-brand-500';

// The wording of the emails the app sends. The layout is the same for all; only the words change.
export default function EmailTemplateComponent() {
    const t = useT();
    const { csrf, setCsrf } = useCsrf();
    const { handleLoading } = useLoading();
    const { showConfirm, showModal, contentModalSuccess, contentModalError } = useModal();
    const [templates, setTemplates] = useState<EmailTemplate[] | null>(null);
    const [open, setOpen] = useState<string | null>(null);
    const [draft, setDraft] = useState<EmailTemplate>({});

    useEffect(() => {
        const load = async () => {
            const res: Response = await readEmailTemplates(setCsrf);
            const data: ResponseApi<EmailTemplate[]> = await handleResponseApi<ResponseApi<EmailTemplate[]>>(res);
            setTemplates(data.data || []);
        };
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount only; setCsrf is a stable context setter
    }, []);

    if (templates === null) {
        return <LoadingContent />;
    }

    const replace = (updated: EmailTemplate) => setTemplates(templates.map(t => (t.id === updated.id ? updated : t)));
    const toggle = (template: EmailTemplate) => {
        if (open === template.id) {
            setOpen(null);
        } else {
            setOpen(template.id || null);
            setDraft(template);
        }
    };

    const save = () => showConfirm(
        <div className="flex flex-col gap-2">
            <h3 className="mb-2 text-lg font-semibold">Email template confirmation</h3>
            <p className="mb-4">Use this wording for every <b>{draft.name}</b> email from now on?</p>
        </div>,
        async () => {
            await handleLoading(async () => {
                const res: Response = await updateEmailTemplate(draft, csrf, setCsrf);
                const data: ResponseApi<EmailTemplate> = await handleResponseApi<ResponseApi<EmailTemplate>>(res);
                if (data.message === API_MSG_SUCCESS && data.data) {
                    replace(data.data);
                    setDraft(data.data);
                    showModal(contentModalSuccess(t('Email template saved')));
                } else {
                    showModal(contentModalError(data.message || t('Failed to save the template.')));
                }
            });
        }, 'Yes', 'Cancel');

    const reset = () => showConfirm(
        <div className="flex flex-col gap-2">
            <h3 className="mb-2 text-lg font-semibold">Back to the built-in text</h3>
            <p className="mb-4">Throw away your wording of the <b>{draft.name}</b> email?</p>
        </div>,
        async () => {
            await handleLoading(async () => {
                const res: Response = await resetEmailTemplate(draft.id || '', csrf, setCsrf);
                const data: ResponseApi<EmailTemplate> = await handleResponseApi<ResponseApi<EmailTemplate>>(res);
                if (data.message === API_MSG_SUCCESS && data.data) {
                    replace(data.data);
                    setDraft(data.data);
                    showModal(contentModalSuccess(t('The built-in text is back')));
                } else {
                    showModal(contentModalError(data.message || t('Failed to reset the template.')));
                }
            });
        }, 'Yes', 'Cancel');

    return (
        <div className="space-y-3">
            <p className="text-sm text-gray-500">
                Change the words of the emails the app sends. Write <code className="rounded bg-gray-100 px-1">{'{{name}}'}</code> where a value
                should be filled in (the allowed ones are listed under each email).
            </p>
            {templates.map(template => (
                <div key={template.id} className="rounded-xl border border-gray-200 bg-white">
                    <button type="button" onClick={() => toggle(template)} className="flex w-full items-center gap-3 px-5 py-4 text-left cursor-pointer">
                        <Mail className="h-5 w-5 text-brand-500" />
                        <div className="min-w-0 flex-1">
                            <p className="font-semibold text-gray-800">{template.name}</p>
                            <p className="text-xs text-gray-500">{template.description}</p>
                        </div>
                        {template.customized && <BadgeComponent variant="blue">{t('Customized')}</BadgeComponent>}
                        <ChevronDown className={`h-5 w-5 text-gray-400 transition ${open === template.id ? 'rotate-180' : ''}`} />
                    </button>
                    {open === template.id && (
                        <div className="space-y-4 border-t border-gray-100 px-5 py-5">
                            <InputComponent id={`${template.id}-subject`} label={t('Subject')} value={draft.subject || ''} onChange={(e) => setDraft({ ...draft, subject: e.target.value })} />
                            <InputComponent id={`${template.id}-heading`} label={t('Heading')} value={draft.heading || ''} onChange={(e) => setDraft({ ...draft, heading: e.target.value })} />
                            <div>
                                <label htmlFor={`${template.id}-intro`} className="mb-2 block text-sm font-medium text-gray-700">{t('Message')}</label>
                                <textarea id={`${template.id}-intro`} rows={3} maxLength={1000} value={draft.intro || ''} onChange={(e) => setDraft({ ...draft, intro: e.target.value })} className={areaClass} />
                            </div>
                            <InputComponent id={`${template.id}-button`} label={t('Button')} value={draft.buttonLabel || ''} onChange={(e) => setDraft({ ...draft, buttonLabel: e.target.value })} />
                            <div>
                                <label htmlFor={`${template.id}-note`} className="mb-2 block text-sm font-medium text-gray-700">{t('Closing note')}</label>
                                <textarea id={`${template.id}-note`} rows={3} maxLength={1000} value={draft.note || ''} onChange={(e) => setDraft({ ...draft, note: e.target.value })} className={areaClass} />
                            </div>
                            <p className="text-xs text-gray-500">
                                Values you can use: {(template.placeholders || []).map(p => <code key={p} className="mr-1 rounded bg-gray-100 px-1">{`{{${p}}}`}</code>)}
                            </p>
                            <div className="flex flex-wrap gap-3">
                                <ButtonComponent type="button" className="w-auto!" onClick={save}>{t('Save')}</ButtonComponent>
                                {template.customized && (
                                    <ButtonComponent type="button" variant="secondary" className="w-auto! gap-1.5" onClick={reset}>
                                        <RotateCcw size={14} /> Back to built-in text
                                    </ButtonComponent>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
