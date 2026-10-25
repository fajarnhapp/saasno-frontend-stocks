'use client';

import { useT } from '@/context/LanguageContext';
import ButtonComponent from '@/component/ui/ButtonComponent';
import { CheckCircle, X } from 'lucide-react';
import { createContext, useContext, useState, ReactNode } from 'react';

interface ModalContextProps {
    showModal: (content: ReactNode, footer?: ReactNode | null) => void;
    showConfirm: (
        content: ReactNode,
        onConfirm: () => Promise<void> | void,
        confirmText?: string,
        cancelText?: string
    ) => void;
    hideModal: () => void;
    contentModalSuccess: (message: string) => ReactNode;
    contentModalError: (message: string) => ReactNode;
}

const ModalContext = createContext<ModalContextProps>({
    showModal: () => { },
    showConfirm: () => { },
    hideModal: () => { },
    contentModalSuccess: () => null,
    contentModalError: () => null,
});

export const useModal = () => useContext(ModalContext);

export const ModalProvider = ({ children }: { children: ReactNode }) => {
    const t = useT();
    const [modalContent, setModalContent] = useState<ReactNode | null>(null);
    const [modalFooter, setModalFooter] = useState<ReactNode | null | undefined>(undefined);

    // Helper untuk mengecek apakah modal sedang aktif
    const isModalOpen = modalContent !== null;

    const showModal = (content: ReactNode, footer?: ReactNode | null) => {
        setModalContent(content);
        setModalFooter(footer);
    };

    const showConfirm = (
        content: ReactNode,
        onConfirm: () => Promise<void> | void,
        confirmText = 'Confirm',
        cancelText = 'Cancel'
    ) => {
        setModalContent(content);
        setModalFooter(
            <div className="flex gap-2 justify-end">
                <ButtonComponent
                    variant="cancel"
                    onClick={hideModal}
                >
                    {t(cancelText)}
                </ButtonComponent>
                <ButtonComponent
                    onClick={async () => {
                        hideModal();
                        try {
                            await onConfirm();
                        } catch (e) {
                            void e;
                        }
                    }}
                >
                    {t(confirmText)}
                </ButtonComponent>
            </div>
        );
    };

    const hideModal = () => {
        setModalContent(null);
        setModalFooter(undefined);
    };

    const contentModalSuccess = (message: string) => {
        return (
            <div className="flex flex-col items-center gap-4">
                <CheckCircle className="text-green-500 animate-bounce" size={48} />
                <div>{message}</div>
            </div>
        )
    }

    const contentModalError = (message: string) => {
        return (
            <div className="flex flex-col items-center gap-4">
                <X className="text-red-500 animate-pulse" size={48} />
                <div>{message}</div>
            </div>
        )
    }

    return (
        <ModalContext.Provider value={{ showModal, showConfirm, hideModal, contentModalSuccess, contentModalError }}>
            {/* Wrapper utama untuk efek disable layar belakang */}
            <div className="relative min-h-screen">
                <div
                    className={`transition-all duration-300 ${isModalOpen ? "pointer-events-none select-none opacity-50 grayscale-[50%] blur-[1px]" : ""
                        }`}
                >
                    {children}
                </div>

                {/* Layer Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/20 backdrop-blur-[2px]">
                        <div
                            className="bg-white p-2 rounded-2xl shadow-2xl relative max-h-[90vh] overflow-auto animate-in fade-in zoom-in duration-200"
                            style={{
                                width: 'auto',
                            }}
                        >
                            <button
                                onClick={hideModal}
                                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                            >
                                <X size={20} />
                            </button>

                            <div className="p-8">{modalContent}</div>

                            {modalFooter === undefined ? (
                                <div className="px-8 pb-6 flex justify-end">
                                    <ButtonComponent variant='cancel' onClick={hideModal} >
                                        {t('Close')}
                                    </ButtonComponent>
                                </div>
                            ) : modalFooter !== null ? (
                                <div className="px-8 pb-4">{modalFooter}</div>
                            ) : null}
                        </div>
                    </div>
                )}
            </div>
        </ModalContext.Provider >
    );
};