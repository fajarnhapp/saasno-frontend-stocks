'use client';

import { createContext, useContext, useState, ReactNode, useEffect, Context } from 'react';

interface Properties {
    csrf: string;
    setCsrf: (token: string) => void;
}

const CsrfContext: Context<Properties> = createContext<Properties>({
    csrf: '',
    setCsrf: () => { },
});

export const useCsrf: () => Properties = (): Properties => useContext(CsrfContext);

export const CsrfProvider = ({ children }: { children: ReactNode }) => {
    const [csrf, setCsrfToken] = useState<string>('');

    useEffect(() => {
        // Membaca dataset dari elemen DOM (server-rendered) yang bukan React state — hanya
        // tersedia setelah mount, jadi memang harus lewat effect, bukan bisa di-derive saat render.
        const initial = document.getElementById('constants')?.dataset.csrf || '';
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (initial) setCsrfToken(initial);
    }, []);

    return (
        <CsrfContext.Provider value={{ csrf, setCsrf: setCsrfToken }}>
            {children}
        </CsrfContext.Provider>
    );
};
