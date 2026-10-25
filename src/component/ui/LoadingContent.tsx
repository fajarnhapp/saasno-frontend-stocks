interface Properties {
    message?: string;
}

// Loading khusus untuk area konten (mis. saat fetch data tabel), bukan modal full-screen —
// dipakai supaya tidak "dobel" tampil bareng modal loading navigasi (LoadingCircleContext).
export default function LoadingContent({ message = "Loading data..." }: Properties) {
    return (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white py-16">
            <div className="h-9 w-9 animate-spin rounded-full border-4 border-gray-200 border-t-brand-600" />
            <p className="text-sm font-medium text-gray-500">{message}</p>
        </div>
    );
}
