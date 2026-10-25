'use client';

import { useRef, useState } from 'react';
import { ImagePlus, Loader2, Palette, Trash2 } from 'lucide-react';
import InputComponent from '../ui/InputComponent';
import ButtonComponent from '../ui/ButtonComponent';
import AppLogo from '../ui/AppLogo';
import { useAppSetting } from '@/context/AppSettingContext';
import { useCsrf } from '@/context/CsrfContext';
import { useModal } from '@/context/ModalContext';
import { deleteLogo, updateAppSetting, uploadLogo } from '@/service/appSettingService';
import { ResponseApi } from '@/type/common/ResponseApi';
import { brandSwatch, clampChroma, clampHue, MAX_BRAND_CHROMA, MIN_BRAND_CHROMA } from '@/utils/brandUtils';
import { ALLOWED_IMAGE_TYPES, validateImageFile } from '@/utils/imageUploadUtils';

// Name, brand colour and logo of the application. Saved in the Configuration table; every page picks them up on the next load.
export default function ApplicationSettingComponent() {
    const setting = useAppSetting();
    const { csrf, setCsrf } = useCsrf();
    const { showModal, contentModalError } = useModal();
    const logoInput = useRef<HTMLInputElement>(null);

    const [appName, setAppName] = useState<string>(setting.appName);
    const [hue, setHue] = useState<number>(setting.brandHue);
    const [chroma, setChroma] = useState<number>(setting.brandChroma);
    const [saving, setSaving] = useState<boolean>(false);
    const [logoBusy, setLogoBusy] = useState<boolean>(false);

    const swatch: string = brandSwatch(hue, chroma);
    const changed: boolean = appName.trim() !== setting.appName || hue !== setting.brandHue || chroma !== setting.brandChroma;

    const fail = async (res: Response, fallback: string) => {
        const data: ResponseApi<unknown> = await res.json().catch(() => ({ message: fallback, data: null }));
        showModal(contentModalError(data.message || fallback));
    };

    const save = async () => {
        if (!appName.trim()) {
            showModal(contentModalError('The application name must not be empty'));
            return;
        }
        setSaving(true);
        try {
            const res: Response = await updateAppSetting({ appName: appName.trim(), brandHue: String(hue), brandChroma: String(chroma) }, csrf, setCsrf);
            if (!res.ok) {
                await fail(res, 'Failed to save the settings');
                return;
            }
            window.location.reload();
        } catch {
            showModal(contentModalError('Failed to save the settings'));
        } finally {
            setSaving(false);
        }
    };

    const onLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file: File | undefined = e.target.files?.[0];
        e.target.value = '';
        const problem: string | null = validateImageFile(file);
        if (problem) {
            showModal(contentModalError(problem));
            return;
        }
        setLogoBusy(true);
        try {
            const res: Response = await uploadLogo(file as File, csrf, setCsrf);
            if (!res.ok) {
                await fail(res, 'Failed to upload the logo');
                return;
            }
            window.location.reload();
        } catch {
            showModal(contentModalError('Failed to upload the logo'));
        } finally {
            setLogoBusy(false);
        }
    };

    const removeLogo = async () => {
        setLogoBusy(true);
        try {
            const res: Response = await deleteLogo(csrf, setCsrf);
            if (!res.ok) {
                await fail(res, 'Failed to remove the logo');
                return;
            }
            window.location.reload();
        } catch {
            showModal(contentModalError('Failed to remove the logo'));
        } finally {
            setLogoBusy(false);
        }
    };

    return (
        <div className="max-w-2xl space-y-5">
            <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-5">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 text-brand-600"><Palette size={20} /></div>
                    <div>
                        <h2 className="text-base font-semibold text-gray-800">Name and colour</h2>
                        <p className="text-xs text-gray-500">Shown on the login page, the sidebar, the browser tab and in emails.</p>
                    </div>
                </div>

                <InputComponent
                    id="appName"
                    label="Application name"
                    placeholder="Saasno"
                    value={appName}
                    onChange={(e) => setAppName(e.target.value.slice(0, 60))}
                />

                <div>
                    <label htmlFor="hue" className="mb-1 flex justify-between text-sm font-medium text-gray-700">
                        <span>Colour (hue)</span><span className="font-mono text-xs text-gray-500">{hue}°</span>
                    </label>
                    <input
                        id="hue" type="range" min={0} max={360} step={1} value={hue}
                        onChange={(e) => setHue(clampHue(e.target.value))}
                        className="w-full cursor-pointer accent-brand-600"
                    />
                </div>

                <div>
                    <label htmlFor="chroma" className="mb-1 flex justify-between text-sm font-medium text-gray-700">
                        <span>Intensity</span><span className="font-mono text-xs text-gray-500">{chroma.toFixed(2)}</span>
                    </label>
                    <input
                        id="chroma" type="range" min={MIN_BRAND_CHROMA} max={MAX_BRAND_CHROMA} step={0.05} value={chroma}
                        onChange={(e) => setChroma(clampChroma(e.target.value))}
                        className="w-full cursor-pointer accent-brand-600"
                    />
                    <p className="mt-1 text-xs text-gray-400">Lower values are more muted. Greens and yellows usually look better around 0.65.</p>
                </div>

                <div className="flex flex-wrap items-center gap-4 rounded-lg border border-gray-100 bg-gray-50 p-4">
                    <span className="text-xs font-medium text-gray-500">Preview</span>
                    <span className="inline-block h-8 w-8 rounded-lg shadow-inner" style={{ backgroundColor: swatch }} />
                    <span className="rounded-xl px-4 py-2 text-sm font-medium text-white" style={{ backgroundColor: swatch }}>{appName.trim() || 'Application'}</span>
                </div>

                <div className="flex gap-2">
                    <ButtonComponent size="sm" onClick={save} disabled={saving || !changed} className="w-auto! gap-1.5">
                        {saving ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : 'Save'}
                    </ButtonComponent>
                    {changed && (
                        <ButtonComponent
                            variant="cancel" size="sm" className="w-auto!"
                            onClick={() => { setAppName(setting.appName); setHue(setting.brandHue); setChroma(setting.brandChroma); }}
                        >
                            Reset
                        </ButtonComponent>
                    )}
                </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 text-brand-600"><ImagePlus size={20} /></div>
                    <div>
                        <h2 className="text-base font-semibold text-gray-800">Logo</h2>
                        <p className="text-xs text-gray-500">PNG or JPEG, up to 2 MB. Shrunk to fit 512 px; a transparent PNG works best.</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <AppLogo size={64} />
                    <div className="flex flex-wrap gap-2">
                        <ButtonComponent variant="outline" size="sm" disabled={logoBusy} onClick={() => logoInput.current?.click()} className="w-auto! gap-1.5">
                            {logoBusy ? <Loader2 size={14} className="animate-spin" /> : <ImagePlus size={14} />}
                            {setting.hasLogo ? 'Change logo' : 'Upload logo'}
                        </ButtonComponent>
                        {setting.hasLogo && (
                            <ButtonComponent variant="cancel" size="sm" disabled={logoBusy} onClick={removeLogo} className="w-auto! gap-1.5">
                                <Trash2 size={14} /> Remove
                            </ButtonComponent>
                        )}
                    </div>
                    <input ref={logoInput} type="file" accept={ALLOWED_IMAGE_TYPES.join(',')} className="hidden" onChange={onLogo} />
                </div>
            </div>
        </div>
    );
}
