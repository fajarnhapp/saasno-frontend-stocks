"use client";

import { useCallback, useState } from "react";

// Loading lokal per-komponen untuk fetch data (dirender inline lewat LoadingContent),
// terpisah dari modal loading global (LoadingCircleContext) yang dipakai untuk navigasi
// dan aksi submit — supaya keduanya tidak numpuk/berkedip dobel saat pindah halaman.
export function useContentLoading() {
    const [isFetching, setIsFetching] = useState(false);

    const withFetching = useCallback(async <T,>(action: () => Promise<T>): Promise<T | undefined> => {
        try {
            setIsFetching(true);
            return await action();
        } finally {
            setIsFetching(false);
        }
    }, []);

    return { isFetching, withFetching };
}
