'use client';

import { useState } from 'react';
import { Check, Copy, Download, KeyRound } from 'lucide-react';
import ButtonComponent from '../ui/ButtonComponent';
import { useAppSetting } from '@/context/AppSettingContext';
import { recoveryCodesToText } from '@/utils/recoveryCodeUtils';

// The recovery codes are shown once: the server keeps only a hash of each, so they cannot be shown again.
export default function RecoveryCodesPanel({ codes, onDone }: { codes: string[]; onDone: () => void }) {
    const { appName } = useAppSetting();
    const [copied, setCopied] = useState<boolean>(false);
    const [saved, setSaved] = useState<boolean>(false);

    const text: string = recoveryCodesToText(codes, appName);

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setSaved(true);
        } catch {
            // The clipboard may be blocked; the codes can still be downloaded or copied by hand.
        }
    };

    const download = () => {
        const url: string = URL.createObjectURL(new Blob([text], { type: 'text/plain' }));
        const link: HTMLAnchorElement = document.createElement('a');
        link.href = url;
        link.download = `${appName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-recovery-codes.txt`;
        link.click();
        URL.revokeObjectURL(url);
        setSaved(true);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-50 text-amber-600">
                    <KeyRound size={20} />
                </div>
                <div>
                    <p className="font-semibold text-gray-800">Save your recovery codes</p>
                    <p className="text-sm text-gray-500 mt-0.5">
                        If you lose your phone, each of these codes lets you log in once instead of the 6-digit code.
                        They are shown only now, so keep them somewhere safe.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-2 rounded-xl border border-gray-200 bg-white p-4 font-mono text-sm text-gray-800 select-all">
                {codes.map((code) => (
                    <span key={code} className="tracking-wider">{code}</span>
                ))}
            </div>

            <div className="flex flex-wrap gap-2">
                <ButtonComponent variant="outline" size="sm" onClick={copy} className="w-auto! gap-1.5">
                    {copied ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy</>}
                </ButtonComponent>
                <ButtonComponent variant="outline" size="sm" onClick={download} className="w-auto! gap-1.5">
                    <Download size={14} /> Download
                </ButtonComponent>
            </div>

            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                <input type="checkbox" className="rounded cursor-pointer" checked={saved} onChange={(e) => setSaved(e.target.checked)} />
                I have saved these codes
            </label>

            <ButtonComponent size="sm" onClick={onDone} disabled={!saved} className="w-auto!">Done</ButtonComponent>
        </div>
    );
}
