'use client';

import React, { useEffect } from "react";

type Properties = {
    isOpen: boolean;
    onClose: () => void;
    base64Image: string;
    title?: string;
};

export default function ImagePreviewModal({
    isOpen,
    onClose,
    base64Image,
    title = "Attendance Photo Preview",
}: Properties) {

    // Kunci scroll halaman utama ketika modal sedang terbuka
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    // Jika modal tidak aktif, jangan rendor apapun ke DOM
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
            onClick={onClose} // Klik di area luar/overlay untuk menutup modal
        >
            {/* Kontainer Utama Modal */}
            <div
                className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden transform transition-all border border-gray-100"
                onClick={(e) => e.stopPropagation()} // Mencegah modal tertutup saat area gambar diklik
            >
                {/* Bagian Kepala Modal */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                    <h3 className="text-base font-semibold text-gray-900">
                        {title}
                    </h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Bagian Konten/Tampilan Foto Base64 */}
                <div className="p-5 bg-gray-50 flex items-center justify-center min-h-[250px]">
                    {base64Image ? (
                        <div className="rounded-lg overflow-hidden border border-gray-200 shadow-sm bg-white aspect-[4/3] w-full">
                            {/* base64Image adalah data URI dinamis (foto absensi hasil capture), bukan
                                aset lokal/remote yang bisa dioptimasi next/image, jadi tetap pakai <img>. */}
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={base64Image}
                                alt="Attendance Preview"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    ) : (
                        <div className="text-center text-sm text-gray-400 py-8">
                            No photo data to display.
                        </div>
                    )}
                </div>

                {/* Bagian Kaki Modal */}
                <div className="px-5 py-3 bg-white border-t border-gray-100 flex justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}