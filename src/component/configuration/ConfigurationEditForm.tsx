import { Configuration } from '@/type/configuration';
import { useEffect, useRef, useState } from 'react';
import { canBeEmpty, formatConfigKey, isSecretKey } from '@/utils/configurationUtils';
import InputComponent from '../ui/InputComponent';
import ButtonComponent from '../ui/ButtonComponent';
import { changedFields, hasChanges } from '@/utils/diffUtils';

interface Properties {
    selected: Configuration;
    submitEdit: (request: Configuration) => void;
    onCancel: () => void;
}

export default function ConfigurationEditForm({ selected, submitEdit, onCancel }: Properties) {
    const secret: boolean = isSecretKey(selected.id || '');
    // A secret is never shown: the field starts empty and only a newly typed value is sent.
    const [configuration, setConfiguration] = useState<Configuration>(secret ? { ...selected, value: '' } : selected);
    const secretIsSet: boolean = !!selected.value;

    // Opens in place of the row that was clicked; bring it into view when the row is far down the page.
    const container = useRef<HTMLDivElement>(null);
    useEffect(() => {
        container.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, []);

    return (
        <div ref={container} className="w-full rounded-2xl border border-gray-200 bg-white px-5 py-7">
            <h3 className="text-base font-semibold tracking-tight text-gray-900">Edit Configuration</h3>
            <p className="mt-1 mb-6 text-sm text-gray-400">
                Key cannot be changed, just update the value.
            </p>

            <div className="-mx-2.5 flex flex-wrap gap-y-5">
                <div className="w-full px-2.5">
                    <span className="mb-1.5 block text-sm font-medium text-gray-700">Key</span>
                    <div className="flex items-baseline gap-2">
                        <span className="text-sm font-semibold text-gray-900">
                            {formatConfigKey(configuration.id || '')}
                        </span>
                        <span className="inline-flex items-center rounded-md bg-gray-100 px-1.5 py-0.5 text-[11px] font-mono font-medium text-gray-500">
                            {configuration.id}
                        </span>
                    </div>
                </div>
                <div className="w-full px-2.5">
                    {secret ? (
                        <>
                            <InputComponent
                                label="New password"
                                type="password"
                                autoComplete="new-password"
                                placeholder={secretIsSet ? 'Type a new password to replace the current one' : 'Enter the password'}
                                value={configuration.value || ''}
                                onChange={(e) => setConfiguration({ ...configuration, value: e.target.value })}
                            />
                            <p className="mt-1.5 text-xs text-gray-400">
                                {secretIsSet
                                    ? 'A password is set. It is never shown; leave the field empty to keep it.'
                                    : 'No password is set.'}
                            </p>
                        </>
                    ) : (
                        <InputComponent
                            label="Value"
                            placeholder="Enter configuration value"
                            value={configuration.value || ''}
                            onChange={(e) => setConfiguration({ ...configuration, value: e.target.value })}
                            required={!canBeEmpty(configuration.id || '')}
                        />
                    )}
                </div>
            </div>
            <div className="flex w-full gap-3 justify-end mt-6">
                {secret && secretIsSet && (
                    <ButtonComponent variant="secondary" onClick={() => submitEdit({ id: selected.id, value: '' })}>
                        Remove password
                    </ButtonComponent>
                )}
                <ButtonComponent variant="secondary" onClick={onCancel}>Cancel</ButtonComponent>
                <ButtonComponent
                    disabled={secret ? !configuration.value : !hasChanges(selected, configuration)}
                    onClick={() => submitEdit(secret ? { id: selected.id, value: configuration.value } : changedFields(selected, configuration))}>Save</ButtonComponent>
            </div>
        </div>
    );
}
