"use client";

import { useCallback, useEffect, useState } from "react";

// Menyimpan perubahan assign/unassign sebagai draft lokal; baru dikirim ke server
// saat user klik Save. `load` dipanggil setiap data assignment dari server di-fetch ulang.
export function useAssignmentDraft() {
    const [original, setOriginal] = useState<string[]>([]);
    const [draft, setDraft] = useState<string[]>([]);

    const load = useCallback((ids: string[]) => {
        setOriginal(ids);
        setDraft(ids);
    }, []);

    const assign = (id: string) => setDraft(d => (d.includes(id) ? d : [...d, id]));
    const unassign = (id: string) => setDraft(d => d.filter(x => x !== id));
    const discard = () => setDraft(original);

    const toAdd = draft.filter(id => !original.includes(id));
    const toRemove = original.filter(id => !draft.includes(id));
    const isDirty = toAdd.length > 0 || toRemove.length > 0;

    // Warn before leaving the page with unsaved changes
    useEffect(() => {
        if (!isDirty) return;
        const handler = (e: BeforeUnloadEvent) => e.preventDefault();
        window.addEventListener('beforeunload', handler);
        return () => window.removeEventListener('beforeunload', handler);
    }, [isDirty]);

    return { draft, toAdd, toRemove, isDirty, load, assign, unassign, discard };
}
