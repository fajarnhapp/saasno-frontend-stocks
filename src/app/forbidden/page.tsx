import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Saasno - Forbidden',
    description: 'Access denied',
};

export default function ForbiddenPage() {
    return (
        <main className="grid min-h-screen place-items-center bg-white px-6 py-24 sm:py-32 lg:px-8">
            <div className="text-center">
                <p className="text-6xl font-bold text-brand-600">403</p>

                <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl">
                    Access Denied
                </h1>
                <p className="mt-6 text-base leading-7 text-gray-600">
                    You don&apos;t have permission to access this page.
                    <br />
                    Please contact your administrator if you believe this is a mistake.
                </p>

                <div className="mt-10 flex items-center justify-center gap-x-6">
                    <Link
                        href="/dashboard"
                        className="rounded-md bg-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-brand-500 transition-all"
                    >
                        Back to Dashboard
                    </Link>
                    <Link href="/dashboard" className="text-sm font-semibold text-gray-900 hover:text-brand-600">
                        Contact support <span aria-hidden="true">&rarr;</span>
                    </Link>
                </div>
            </div>
        </main>
    );
}
