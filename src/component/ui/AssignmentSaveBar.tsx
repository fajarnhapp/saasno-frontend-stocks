'use client';

import ButtonComponent from './ButtonComponent';

interface AssignmentSaveBarProps {
    addCount: number;
    removeCount: number;
    onDiscard: () => void;
    onSave: () => void;
}

export default function AssignmentSaveBar({ addCount, removeCount, onDiscard, onSave }: AssignmentSaveBarProps) {
    const isDirty = addCount > 0 || removeCount > 0;

    return (
        <div className="mt-6 mx-2.5 flex flex-col gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-gray-600">
                {isDirty ? (
                    <span className="flex flex-wrap items-center gap-2">
                        <span className="font-medium text-gray-700">Unsaved changes:</span>
                        {addCount > 0 && (
                            <span className="rounded-md bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">+{addCount} to assign</span>
                        )}
                        {removeCount > 0 && (
                            <span className="rounded-md bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">−{removeCount} to unassign</span>
                        )}
                    </span>
                ) : (
                    'No changes'
                )}
            </div>
            <div className="flex gap-2 sm:w-auto">
                <ButtonComponent
                    variant="cancel"
                    className="sm:w-28 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={!isDirty}
                    onClick={onDiscard}
                >
                    Reset
                </ButtonComponent>
                <ButtonComponent
                    className="sm:w-36 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={!isDirty}
                    onClick={onSave}
                >
                    Save Changes
                </ButtonComponent>
            </div>
        </div>
    );
}
