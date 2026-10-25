"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { usePathname } from "next/navigation";

interface LoadingContextType {
    isLoading: boolean;
    message: string;
    handleLoading: <T, >(
        action: () => Promise<T>,
        customMessage?: string
    ) => Promise<T | undefined>;
    showLoading: (customMessage?: string) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const LoadingCircleProvider = ({ children }: { children: ReactNode }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState("Please Wait...");
    const pathname = usePathname();

    // useCallback dengan deps kosong: hanya memakai setter state yang stabil, jadi identitas
    // fungsi ini aman dijadikan dependency di effect manapun tanpa memicu re-run berulang.
    const handleLoading = useCallback(async <T,>(
        action: () => Promise<T>,
        customMessage?: string
    ): Promise<T | undefined> => {
        try {
            setIsLoading(true);
            setMessage(customMessage || "Please Wait...");
            const result = await action();
            return result;
        } catch (error) {
            console.error("Loading Error:", error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Untuk navigasi klik (mis. menu sidebar): tampilkan loading seketika saat diklik,
    // sebelum proses render/fetch halaman tujuan berjalan.
    const showLoading = useCallback((customMessage?: string) => {
        setMessage(customMessage || "Please Wait...");
        setIsLoading(true);
    }, []);

    // Jaring pengaman: begitu route benar-benar berpindah, matikan loading meskipun
    // halaman tujuan tidak memanggil handleLoading sendiri (mis. Dashboard) — di-adjust
    // langsung saat render mengikuti pola resmi React untuk "adjust state on prop change".
    const [prevPathname, setPrevPathname] = useState(pathname);
    if (pathname !== prevPathname) {
        setPrevPathname(pathname);
        setIsLoading(false);
    }

    return (
        <LoadingContext.Provider value={{ isLoading, handleLoading, showLoading, message }}>
            <div className="relative min-h-screen">
                <div className={`transition-all duration-300 ${isLoading ? "pointer-events-none select-none opacity-50 grayscale-[50%]" : ""}`}>
                    {children}
                </div>

                {isLoading && (
                    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/20 backdrop-blur-[2px]">
                        <div className="flex flex-col items-center p-6 bg-white rounded-2xl shadow-xl">
                            <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-brand-600"></div>
                            <p className="mt-4 font-semibold text-gray-700">{message}</p>
                        </div>
                    </div>
                )}
            </div>
        </LoadingContext.Provider>
    );
};

export const useLoading = () => {
    const context = useContext(LoadingContext);
    if (!context) throw new Error("useLoading must be used within LoadingCircleProvider");
    return context;
};