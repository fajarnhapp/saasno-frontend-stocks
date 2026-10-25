import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: "Saasno - Not Found",
    description: "Home application",
};


export default function NotFound() {
    return (
        <main className="grid min-h-screen place-items-center bg-white px-6 py-24 sm:py-32 lg:px-8">
            <div className="text-center">
                {/* Kode Status */}
                <p className="text-6xl font-bold text-brand-600">404</p>

                {/* Judul & Deskripsi */}
                <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl">
                    Page not found
                </h1>
                <p className="mt-6 text-base leading-7 text-gray-600">
                    Sorry, we couldn&apos;t find the page you&apos;re looking for.
                </p>

                {/* Tombol Aksi */}
                <div className="mt-10 flex items-center justify-center gap-x-6">
                    <Link
                        href="/dashboard"
                        className="rounded-md bg-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-brand-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 transition-all"
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