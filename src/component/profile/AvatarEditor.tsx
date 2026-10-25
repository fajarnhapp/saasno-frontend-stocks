'use client';

import { useRef, useState } from 'react';
import { Camera, Loader2, Trash2 } from 'lucide-react';
import Avatar from '../ui/Avatar';
import ButtonComponent from '../ui/ButtonComponent';
import { useCsrf } from '@/context/CsrfContext';
import { useModal } from '@/context/ModalContext';
import { useUser } from '@/context/UserContext';
import { deleteAvatar, uploadAvatar } from '@/service/avatarService';
import { ResponseApi } from '@/type/common/ResponseApi';
import { ALLOWED_IMAGE_TYPES, validateImageFile } from '@/utils/imageUploadUtils';
import { useT } from '@/context/LanguageContext';

// The profile picture with buttons to change or remove it.
export default function AvatarEditor() {
    const t = useT();
    const { user } = useUser();
    const { csrf, setCsrf } = useCsrf();
    const { showModal, contentModalError } = useModal();
    const input = useRef<HTMLInputElement>(null);
    const [busy, setBusy] = useState<boolean>(false);

    const fail = async (res: Response, fallback: string) => {
        const data: ResponseApi<unknown> = await res.json().catch(() => ({ message: fallback, data: null }));
        showModal(contentModalError(data.message || fallback));
    };

    const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file: File | undefined = e.target.files?.[0];
        e.target.value = '';
        const problem: string | null = validateImageFile(file);
        if (problem) {
            showModal(contentModalError(problem));
            return;
        }
        setBusy(true);
        try {
            const res: Response = await uploadAvatar(file as File, csrf, setCsrf);
            if (!res.ok) {
                await fail(res, t('Failed to upload the picture'));
                return;
            }
            // The picture is part of the loaded user; reloading shows the new one everywhere (header, sidebar, profile).
            window.location.reload();
        } catch {
            showModal(contentModalError(t('Failed to upload the picture')));
        } finally {
            setBusy(false);
        }
    };

    const onRemove = async () => {
        setBusy(true);
        try {
            const res: Response = await deleteAvatar(csrf, setCsrf);
            if (!res.ok) {
                await fail(res, t('Failed to remove the picture'));
                return;
            }
            window.location.reload();
        } catch {
            showModal(contentModalError(t('Failed to remove the picture')));
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="flex items-center gap-4">
            <Avatar version={user.avatarVersion} size={64} />
            <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                    <ButtonComponent variant="outline" size="sm" disabled={busy} onClick={() => input.current?.click()} className="w-auto! gap-1.5">
                        {busy ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
                        {user.avatarVersion ? t('Change photo') : t('Upload photo')}
                    </ButtonComponent>
                    {user.avatarVersion ? (
                        <ButtonComponent variant="cancel" size="sm" disabled={busy} onClick={onRemove} className="w-auto! gap-1.5">
                            <Trash2 size={14} /> Remove
                        </ButtonComponent>
                    ) : null}
                </div>
                <p className="text-xs text-gray-400">{t('PNG or JPEG, up to 2 MB. It is cropped to a square.')}</p>
            </div>
            <input ref={input} type="file" accept={ALLOWED_IMAGE_TYPES.join(',')} className="hidden" onChange={onFile} />
        </div>
    );
}
