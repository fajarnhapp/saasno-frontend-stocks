import { Api } from '@/type/api';
import { useEffect, useRef, useState } from 'react';
import InputComponent from '../ui/InputComponent';
import ButtonComponent from '../ui/ButtonComponent';
import { changedFields, hasChanges } from '@/utils/diffUtils';


// Mirrors ApiEntity.beforeInsert in the backend: GET + /api/role-menu -> GET_API_ROLE_MENU
function generateApiId(method?: string, path?: string): string {
    const apiPath: string = (path || '').slice(Math.max((path || '').indexOf('/api'), 0));
    return `${method?.trim() || ''}_${apiPath}`
        .replace(/[/-]/g, '_')
        .replace(/_+/g, '_')
        .toUpperCase();
}

interface Properties {
    setViewMode: (mode: string) => void;
    submitCreate: (request: Api) => void;
    submitEdit?: (request: Api) => void;
    selected?: Api | null;
}

export default function ApiCreateForm({ setViewMode, submitCreate, submitEdit, selected }: Properties) {
    const [api, setApi] = useState<Api>(selected || {});
    const isEdit = !!selected;
    const container = useRef<HTMLDivElement>(null);

    // An edit opens under its row, which can be far below the fold, so bring it into view.
    useEffect(() => {
        if (isEdit) {
            container.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [isEdit]);

    return (
        <div ref={container} className={`w-full rounded-2xl border border-gray-200 bg-white px-5 py-7 ${isEdit ? '' : 'mb-4'}`}>
            <h3 className="mb-4 text-base font-semibold">{isEdit ? 'Edit API' : 'Add API'}</h3>
            <div className="-mx-2.5 flex flex-wrap gap-y-5">
                <div className="w-full px-2.5">
                    <InputComponent
                        value={api.name || ''}
                        label="API Name"
                        placeholder="Example: Add User"
                        onChange={(e) => setApi({ ...api, name: e.target.value })}
                        required
                    />
                </div>
                <div className="w-full px-2.5 xl:w-1/3">
                    <InputComponent
                        value={api.id || ''}
                        label="API ID"
                        placeholder="GET_API_EXAMPLE"
                        required
                        disabled
                    />
                </div>
                <div className="w-full px-2.5 xl:w-1/3">
                    <InputComponent
                        value={api.method || ''}
                        label="Method"
                        placeholder="GET"
                        onChange={(e) => setApi({ ...api, method: e.target.value, id: isEdit ? api.id : generateApiId(e.target.value, api.path) })}
                        required
                    />
                </div>
                <div className="w-full px-2.5 xl:w-1/3">
                    <InputComponent
                        value={api.path || ''}
                        label="Path"
                        placeholder="/api/v1/example"
                        onChange={(e) => setApi({ ...api, path: e.target.value, id: isEdit ? api.id : generateApiId(api.method, e.target.value) })}
                        required
                    />
                </div>
            </div>
            <div className="flex w-full gap-3 justify-end mt-6">
                <ButtonComponent variant="secondary" onClick={() => setViewMode('TABLE')}>{isEdit ? 'Cancel' : 'Reset'}</ButtonComponent>
                <ButtonComponent
                    disabled={isEdit && !hasChanges(selected, api)}
                    onClick={() => isEdit ? submitEdit?.(changedFields(selected, api)) : submitCreate(api)}>
                    {isEdit ? 'Update' : 'Save'}
                </ButtonComponent>
            </div>
        </div>
    );
}
