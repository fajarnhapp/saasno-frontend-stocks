import Csrf from '@/component/csrf';
import { ReactNode } from 'react';

export default function PublicLayout({ children }: { children: ReactNode }) {
    return (
        <>
            <Csrf />
            {children}
        </>
    );
}
