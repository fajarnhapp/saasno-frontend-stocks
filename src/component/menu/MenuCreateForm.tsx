import { Menu } from '@/type/menu';
import { useEffect, useRef, useState } from 'react';
import InputComponent from '../ui/InputComponent';
import ButtonComponent from '../ui/ButtonComponent';
import { changedFields, hasChanges } from '@/utils/diffUtils';

interface Properties {
    setViewMode: (mode: string) => void;
    submitCreate: (request: Menu) => void;
    submitEdit?: (request: Menu) => void;
    selected?: Menu | null;
}

export default function MenuCreateForm({ setViewMode, submitCreate, submitEdit, selected }: Properties) {
    const [menu, setMenu] = useState<Menu>(selected || {});
    const isEdit = !!selected;
    const container = useRef<HTMLDivElement>(null);

    // An edit opens under its row, which can be far below the fold, so bring it into view.
    useEffect(() => {
        if (isEdit) {
            container.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [isEdit]);


    // Backend reads parentId when orderIndex changes, so send it along in that case.
    const editRequest = (original: Menu): Menu => changedFields(original, menu,
        original.orderIndex !== menu.orderIndex ? ['id', 'parentId'] : ['id']);
    return (
        <div ref={container} className={`w-full rounded-2xl border border-gray-200 bg-white px-5 py-7 ${isEdit ? '' : 'mb-4'}`}>
            <h3 className="mb-4 text-base font-semibold">{isEdit ? 'Edit Menu' : 'Menu Form'}</h3>
            <div className="-mx-2.5 flex flex-wrap gap-y-5 mb-5">
                <div className="w-full px-2.5 xl:w-1/3">
                    <InputComponent
                        value={menu.id || ''}
                        label="Menu Id"
                        placeholder="Menu Id"
                        onChange={(e) => setMenu({ ...menu, id: e.target.value })}
                        required
                        disabled={isEdit}
                    />
                </div>
                <div className="w-full px-2.5 xl:w-1/3">
                    <InputComponent
                        value={menu.name || ''}
                        label="Menu Name"
                        placeholder="Menu Name"
                        onChange={(e) => setMenu({ ...menu, name: e.target.value })}
                        required
                    />
                </div>
                <div className="w-full px-2.5 xl:w-1/3">
                    <InputComponent
                        value={menu.icon || ''}
                        label="Icon"
                        placeholder="Icon (e.g. dashboard, users)"
                        onChange={(e) => setMenu({ ...menu, icon: e.target.value })}
                    />
                </div>
                <div className="w-full px-2.5 xl:w-1/3">
                    <InputComponent
                        value={menu.url || ''}
                        label="URL"
                        placeholder="URL (e.g. /dashboard)"
                        onChange={(e) => setMenu({ ...menu, url: e.target.value })}
                    />
                </div>
                <div className="w-full px-2.5 xl:w-1/3">
                    <InputComponent
                        value={menu.orderIndex?.toString() || ''}
                        label="Order Index"
                        type="number"
                        placeholder="Order Index"
                        onChange={(e) => setMenu({ ...menu, orderIndex: Number(e.target.value) })}
                    />
                </div>
                <div className="w-full px-2.5 xl:w-1/3">
                    <InputComponent
                        value={menu.parentId || ''}
                        label="Parent ID"
                        placeholder="Parent ID (optional)"
                        onChange={(e) => setMenu({ ...menu, parentId: e.target.value })}
                    />
                </div>
            </div>
            {isEdit ? (
                <div className="flex w-full gap-3 justify-end">
                    <ButtonComponent variant="secondary" onClick={() => setViewMode('TABLE')}>Cancel</ButtonComponent>
                    <ButtonComponent
                        disabled={!hasChanges(selected, menu)}
                        onClick={() => submitEdit?.(editRequest(selected))}>
                        Update
                    </ButtonComponent>
                </div>
            ) : (
                <ButtonComponent onClick={() => submitCreate(menu)}>Save</ButtonComponent>
            )}
        </div>
    );
}
