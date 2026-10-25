'use client';

import { useEffect, useState } from 'react';
import { BadgeCheck, MailWarning, Plus, Trash2, UserRound } from 'lucide-react';
import ButtonComponent from '../ui/ButtonComponent';
import InputComponent from '../ui/InputComponent';
import SearchableDropdown from '../ui/SearchableDropdown';
import { useCsrf } from '@/context/CsrfContext';
import { useModal } from '@/context/ModalContext';
import { readPersonMe, requestEmailVerification, updatePersonMe } from '@/service/personService';
import { ResponseApi } from '@/type/common/ResponseApi';
import { Option } from '@/type/option';
import { Contact, Person } from '@/type/user';
import { API_MSG_SUCCESS, handleResponseApi } from '@/utils/responseApiUtils';
import { useT } from '@/context/LanguageContext';

const GENDERS: Option[] = [
    { label: 'Male', value: 'MALE' },
    { label: 'Female', value: 'FEMALE' },
];

const RELIGIONS: Option[] = [
    { label: 'Islam', value: 'ISLAM' },
    { label: 'Christian', value: 'CHRISTIAN' },
    { label: 'Catholic', value: 'CATHOLIC' },
    { label: 'Hindu', value: 'HINDU' },
    { label: 'Buddhist', value: 'BUDDHIST' },
    { label: 'Confucian', value: 'CONFUCIAN' },
    { label: 'Other', value: 'OTHER' },
];

const LABELS: Option[] = [
    { label: 'Personal', value: 'PERSONAL' },
    { label: 'Work', value: 'WORK' },
    { label: 'Other', value: 'OTHER' },
];

const labelOf = (options: Option[], value?: string): string => options.find(o => o.value === value)?.label ?? '';

// The same options with their labels in the language of the screen.
const translated = (options: Option[], t: (text: string) => string): Option[] => options.map(o => ({ ...o, label: t(o.label) }));

// Biodata (name, birth, gender, religion) and contacts (emails, phone numbers) of the signed-in user.
export default function PersonCard() {
    const t = useT();
    const genders: Option[] = translated(GENDERS, t);
    const religions: Option[] = translated(RELIGIONS, t);
    const labels: Option[] = translated(LABELS, t);
    const { csrf, setCsrf } = useCsrf();
    const { showModal, contentModalSuccess, contentModalError } = useModal();
    const [person, setPerson] = useState<Person | null>(null);
    const [saved, setSaved] = useState<Person | null>(null);
    const [busy, setBusy] = useState<boolean>(false);
    // The role may not have this feature: then the card is left out instead of staying a grey box.
    const [unavailable, setUnavailable] = useState<boolean>(false);

    useEffect(() => {
        const load = async () => {
            const res: Response = await readPersonMe(setCsrf);
            const data: ResponseApi<Person> = await handleResponseApi<ResponseApi<Person>>(res);
            if (data.data) {
                setPerson(data.data);
                setSaved(data.data);
            } else {
                setUnavailable(true);
            }
        };
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount only; setCsrf is a stable context setter
    }, []);

    if (unavailable) {
        return null;
    }

    if (!person) {
        return <div className="h-40 rounded-xl border border-gray-200 bg-white animate-pulse" />;
    }

    const dirty: boolean = JSON.stringify(person) !== JSON.stringify(saved);
    const contacts: Contact[] = person.contacts ?? [];
    const set = (patch: Partial<Person>) => setPerson({ ...person, ...patch });
    const setContact = (index: number, patch: Partial<Contact>) =>
        set({ contacts: contacts.map((c, i) => (i === index ? { ...c, ...patch } : c)) });

    // Exactly one primary per type: choosing one clears the others of the same type.
    const makePrimary = (index: number) => {
        const type = contacts[index].type;
        set({ contacts: contacts.map((c, i) => (c.type === type ? { ...c, primary: i === index } : c)) });
    };
    const addContact = (type: 'EMAIL' | 'PHONE') =>
        set({ contacts: [...contacts, { type, value: '', label: 'PERSONAL', primary: !contacts.some(c => c.type === type) }] });
    const removeContact = (index: number) => {
        const next: Contact[] = contacts.filter((_, i) => i !== index);
        const type = contacts[index].type;
        // The primary one is gone: the first left of that type takes over.
        if (contacts[index].primary) {
            const first: number = next.findIndex(c => c.type === type);
            if (first >= 0) next[first] = { ...next[first], primary: true };
        }
        set({ contacts: next });
    };

    const save = async () => {
        setBusy(true);
        try {
            const res: Response = await updatePersonMe(person, csrf, setCsrf);
            const data: ResponseApi<Person> = await handleResponseApi<ResponseApi<Person>>(res);
            if (data.message === API_MSG_SUCCESS && data.data) {
                setPerson(data.data);
                setSaved(data.data);
                showModal(contentModalSuccess(t('Your details are saved')));
            } else {
                showModal(contentModalError(data.message || t('Failed to save your details')));
            }
        } catch {
            showModal(contentModalError(t('Failed to save your details')));
        } finally {
            setBusy(false);
        }
    };

    const sendVerification = async (contactId: string) => {
        setBusy(true);
        try {
            const res: Response = await requestEmailVerification(contactId, csrf, setCsrf);
            const data: ResponseApi<unknown> = await handleResponseApi<ResponseApi<unknown>>(res);
            showModal(data.message === API_MSG_SUCCESS
                ? contentModalSuccess(t('We emailed you a confirmation link. It works for 24 hours.'))
                : contentModalError(data.message || t('Failed to send the confirmation link')));
        } catch {
            showModal(contentModalError(t('Failed to send the confirmation link')));
        } finally {
            setBusy(false);
        }
    };

    // Status of a saved email: confirmed, or waiting for the link in the email to be opened. Unsaved changes have no status yet.
    const emailStatus = (contact: Contact) => {
        const stored: Contact | undefined = (saved?.contacts ?? []).find(c => c.id && c.id === contact.id);
        if (!stored || stored.value !== contact.value) return null;
        if (stored.verifiedAt) {
            return <span className="flex items-center gap-1 pb-2 text-xs text-green-600"><BadgeCheck size={14} /> {t('Verified')}</span>;
        }
        return (
            <span className="flex items-center gap-1 pb-2 text-xs text-amber-600">
                <MailWarning size={14} /> {t('Not verified')}
                <button type="button" disabled={busy} onClick={() => sendVerification(stored.id as string)} className="ml-1 underline cursor-pointer disabled:opacity-50">{t('Send link')}</button>
            </span>
        );
    };

    const rows = (type: 'EMAIL' | 'PHONE') => contacts.map((contact, index) => ({ contact, index })).filter(r => r.contact.type === type);

    const contactList = (type: 'EMAIL' | 'PHONE', title: string) => (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">{title}</span>
                <ButtonComponent variant="outline" size="sm" onClick={() => addContact(type)} className="w-auto! gap-1">
                    <Plus size={14} /> {t('Add')}
                </ButtonComponent>
            </div>
            {rows(type).length === 0 && <p className="text-xs text-gray-400">{t('None yet.')}</p>}
            {rows(type).map(({ contact, index }) => (
                <div key={contact.id ?? `new-${index}`} className="flex flex-wrap items-end gap-2 rounded-lg border border-gray-100 bg-gray-50 p-3">
                    <div className="min-w-48 flex-1">
                        <InputComponent
                            type={type === 'EMAIL' ? 'email' : 'text'}
                            autoComplete="off"
                            placeholder={type === 'EMAIL' ? 'name@example.com' : '+62 812-3456-7890'}
                            value={contact.value ?? ''}
                            onChange={(e) => setContact(index, { value: e.target.value })}
                        />
                    </div>
                    <div className="w-36">
                        <SearchableDropdown
                            placeholder={t('Label')}
                            options={labels}
                            value={labelOf(labels, contact.label)}
                            onChange={(opt) => setContact(index, { label: (opt?.value as Contact['label']) ?? 'PERSONAL' })}
                        />
                    </div>
                    {type === 'EMAIL' && emailStatus(contact)}
                    <label className="flex items-center gap-1.5 pb-2 text-xs text-gray-600">
                        <input type="radio" name={`primary-${type}`} checked={!!contact.primary} onChange={() => makePrimary(index)} />
                        {t('Primary')}
                    </label>
                    <button type="button" title={t('Remove')} onClick={() => removeContact(index)} className="mb-1 rounded p-1.5 text-red-600 hover:bg-red-50 cursor-pointer">
                        <Trash2 size={16} />
                    </button>
                </div>
            ))}
        </div>
    );

    return (
        <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-700">
                <UserRound className="h-4 w-4 text-brand-500" />
                {t('Personal details')}
            </h3>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <InputComponent id="person-full-name" label={t('Full name')} value={person.fullName ?? ''} onChange={(e) => set({ fullName: e.target.value })} required />
                <InputComponent id="person-nickname" label={t('Nickname')} value={person.nickname ?? ''} onChange={(e) => set({ nickname: e.target.value })} />
                <InputComponent id="person-birth-place" label={t('Birth place')} value={person.birthPlace ?? ''} onChange={(e) => set({ birthPlace: e.target.value })} />
                <InputComponent id="person-birth-date" label={t('Birth date')} type="date" value={person.birthDate ?? ''} onChange={(e) => set({ birthDate: e.target.value })} />
                <SearchableDropdown
                    label={t('Gender')}
                    placeholder={t('Select gender')}
                    options={genders}
                    value={labelOf(genders, person.gender)}
                    onChange={(opt) => set({ gender: opt?.value ?? '' })}
                />
                <SearchableDropdown
                    label={t('Religion')}
                    placeholder={t('Select religion')}
                    options={religions}
                    value={labelOf(religions, person.religion)}
                    onChange={(opt) => set({ religion: opt?.value ?? '' })}
                />
            </div>

            <div className="mt-6 space-y-5">
                {contactList('EMAIL', t('Email addresses'))}
                {contactList('PHONE', t('Phone numbers'))}
                <p className="text-xs text-gray-400">{t('The primary email receives password reset links and sign-in alerts, and can also be used to sign in. Password reset links only go to a verified address.')}</p>
            </div>

            <div className="mt-5 flex justify-end">
                <ButtonComponent onClick={save} disabled={busy || !dirty} className="w-auto!">
                    {busy ? t('Saving…') : t('Save')}
                </ButtonComponent>
            </div>
        </div>
    );
}
