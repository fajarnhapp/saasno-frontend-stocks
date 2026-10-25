'use client';

import { useT } from '@/context/LanguageContext';
import LanguageSwitcher from '@/component/ui/LanguageSwitcher';
import { useLoading } from "@/context/LoadingCircleContext";
import { useModal } from "@/context/ModalContext";
import { Notification } from "@/type/notification";
import { formatDate, formatTimeAgo } from "@/utils/formatterUtils";
import { Bell, Eye, Menu, Search, User, UserIcon } from "lucide-react";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { useRouter, usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import BadgeComponent from "../ui/BadgeComponent";
import { logout } from "@/service/logoutService";
import { useCsrf } from "@/context/CsrfContext";
import { ResponseApi } from "@/type/common/ResponseApi";
import { API_MSG_SUCCESS, handleResponseApi, handleResponseTable } from "@/utils/responseApiUtils";
import { editNotificationUnreadMe, readNotificationUnreadMe } from "@/service/notificationUnreadService";
import { NotificationUnread } from "@/type/notification/NotificationUnread";
import { editNotificationMe, readNotificationMe } from "@/service/notificationService";
import { ResponseTable } from "@/type/common/ResponseTable";
import type { User as UserType } from "@/type/user";
import { SetCsrfFn } from "@/utils/csrfUtils";
import { useUser } from "@/context/UserContext";
import { useAppSetting } from "@/context/AppSettingContext";
import Avatar from "@/component/ui/Avatar";
import { useNotificationStream } from "@/hooks/useNotificationStream";

// Satu halaman daftar notifikasi; server membatasi isinya ke sebulan terakhir.
const NOTIFICATION_PAGE = 20;

// Selalu terbaru dulu dan tanpa data yang lebih tua dari sebulan (dibatasi juga di server). order dan sorting dikirim di setiap
// permintaan: tanpa order, urutan baris tidak terjamin dan halaman berikutnya bisa mengulang atau melewatkan data.
const pageFilter = (offset: number) => ({ order: 'registered', sorting: 'DESC', offset, limit: NOTIFICATION_PAGE });

// Menggabungkan halaman: yang sudah ada diperbarui (status baca), yang baru ditambahkan, tanpa ganda.
const merge = (current: Notification[], incoming: Notification[], append: boolean): Notification[] => {
    const fresh = new Map(incoming.map((n) => [n.id, n]));
    const known = new Set(current.map((n) => n.id));
    const updated = current.map((n) => fresh.get(n.id) ?? n);
    const added = incoming.filter((n) => !known.has(n.id));
    return append ? [...updated, ...added] : [...added, ...updated];
};

export default function HeaderComponent({ toggle, onSearch }: { toggle: () => void; onSearch: () => void }) {
    const t = useT();
    const router: AppRouterInstance = useRouter();
    const [newNotificationCount, setNewNotificationCount] = useState<number>(0);
    const [open, setOpen] = useState<"profile" | "notif" | null>(null);
    const [displayTitle, setDisplayTitle] = useState<string>("");
    const ref = useRef<HTMLDivElement>(null);
    const pathname = usePathname();
    const { csrf, setCsrf } = useCsrf();
    const { appName } = useAppSetting();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [notifLoading, setNotifLoading] = useState<boolean>(true);
    // Jumlah notifikasi sebulan terakhir di server; masih ada yang belum dimuat selama jumlah termuat lebih kecil.
    const [notifTotal, setNotifTotal] = useState<number>(0);
    const [loadingMore, setLoadingMore] = useState<boolean>(false);
    // Satu pengambilan lanjutan pada satu waktu: scroll memicu banyak event, dan dua pengambilan dengan offset yang sama
    // menggandakan data lalu melompati halaman berikutnya.
    const loadingMoreRef = useRef<boolean>(false);
    const { user, loading } = useUser();
    const hasMore = notifications.length < notifTotal;

    const loadFirstPage = useCallback(async (): Promise<void> => {
        const response = await readNotificationMe(pageFilter(0), setCsrf);
        const data: ResponseTable<Notification[]> = await handleResponseTable(response);
        const rows = data?.data || [];
        // Notifikasi baru masuk di depan; yang sudah dimuat lewat scroll tetap ada.
        setNotifications((current) => merge(current, rows, false));
        setNotifTotal(Number(data?.grandTotal || 0));
    }, [setCsrf]);

    useEffect(() => {
        const init = async () => {
            const notificationUnreadResponse = await readNotificationUnreadMe(setCsrf);
            const notificationUnreadData: ResponseApi<NotificationUnread> = await handleResponseApi(notificationUnreadResponse);
            if (notificationUnreadData.message === API_MSG_SUCCESS) {
                setNewNotificationCount(notificationUnreadData.data.total || 0);
            }

            await loadFirstPage();
            setNotifLoading(false);
        };
        init();
    }, [setCsrf, loadFirstPage]);

    useEffect(() => {
        const updateTitle = () => {
            const fullTitle = document.title;
            const parts = fullTitle.split(' - ');
            const cleanTitle = parts.length > 1 ? parts[1] : "Dashboard";
            setDisplayTitle(cleanTitle);
        };
        const timer = setTimeout(updateTitle, 150);
        return () => clearTimeout(timer);
    }, [pathname]);

    useEffect(() => {
        // Until the page's own title has been read (see above), leave document.title alone; overwriting it with an empty title made
        // every page show "Dashboard" in the header.
        if (!displayTitle) return;
        const prefix = newNotificationCount > 0 ? `(${newNotificationCount}) ` : "";
        document.title = `${prefix}${appName} - ${displayTitle}`;
    }, [newNotificationCount, displayTitle, appName]);

    const onNewNotification = useCallback(async () => {
        try {
            const unreadRes = await readNotificationUnreadMe(setCsrf);
            const unreadData: ResponseApi<NotificationUnread> = await handleResponseApi(unreadRes);
            if (unreadData?.data) {
                setNewNotificationCount(unreadData.data.total || 0);
            }
            await loadFirstPage();
        } catch (err) {
            console.error("Error fetching notification data:", err);
        }
    }, [setCsrf, loadFirstPage]);

    useNotificationStream(onNewNotification);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleToggleNotif = async () => {
        if (open !== "notif") {
            setNewNotificationCount(0);
            setOpen("notif");
            editNotificationUnreadMe(csrf, setCsrf);
        } else {
            setOpen(null);
        }
    };

    const fetchMoreNotifications = async () => {
        if (!hasMore || loadingMoreRef.current) return;
        loadingMoreRef.current = true;
        setLoadingMore(true);
        try {
            // Offset = jumlah yang sudah dimuat, jadi selalu sejajar dengan isi daftar walau ada notifikasi baru di depan.
            const response = await readNotificationMe(pageFilter(notifications.length), setCsrf);
            const data: ResponseTable<Notification[]> = await handleResponseTable(response);
            const rows = data?.data || [];
            const next = merge(notifications, rows, true);
            setNotifications(next);
            // Halaman kosong berarti tidak ada lagi (jumlah total bisa menyusut karena pembersihan).
            setNotifTotal(rows.length > 0 ? Number(data?.grandTotal || 0) : next.length);
        } finally {
            loadingMoreRef.current = false;
            setLoadingMore(false);
        }
    };

    return (
        <header className="h-16 px-4 flex items-center justify-between bg-white shadow-sm border-b border-gray-100">
            <div className="flex items-center gap-4">
                <button onClick={toggle} className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 transition cursor-pointer">
                    <Menu size={20} />
                </button>

                <div className="flex items-center gap-2 select-none">
                    <h1 className="font-bold text-brand-600 text-lg tracking-tight cursor-pointer" onClick={() => router.push('/dashboard')}>
                        {appName}
                    </h1>
                    <span className="text-gray-300 font-extralight text-xl">/</span>
                    <h2 className="font-medium text-gray-700 truncate max-w-[150px] md:max-w-xs">
                        {displayTitle}
                    </h2>
                </div>
            </div>

            <div ref={ref} className="flex items-center gap-3 relative shrink-0">
                <button
                    onClick={onSearch}
                    aria-label={t('Search (Ctrl+K)')}
                    title={t('Search (Ctrl+K)')}
                    className="flex h-10 items-center gap-2 rounded-lg border border-gray-200 px-3 text-sm text-gray-400 transition hover:bg-gray-50 cursor-pointer"
                >
                    <Search size={16} />
                    <span className="hidden md:inline">{t('Search…')}</span>
                    <kbd className="hidden rounded border border-gray-200 px-1.5 py-0.5 text-[10px] font-medium md:inline">Ctrl K</kbd>
                </button>
                <button
                    onClick={handleToggleNotif}
                    className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 transition cursor-pointer relative"
                >
                    <Bell size={20} className="text-gray-500" />
                    {newNotificationCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand-500 text-[10px] font-bold text-white ring-2 ring-white">
                            {newNotificationCount > 9 ? '9+' : newNotificationCount}
                        </span>
                    )}
                </button>

                <button
                    onClick={() => setOpen(open === "profile" ? null : "profile")}
                    className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 transition cursor-pointer"
                >
                    {user?.avatarVersion ? <Avatar version={user.avatarVersion} size={32} /> : <User size={20} className="text-gray-500" />}
                </button>

                {open === "notif" && (
                    <NotificationDropdown
                        csrf={csrf}
                        setCsrf={setCsrf}
                        notifications={notifications}
                        setNotifications={setNotifications}
                        loading={notifLoading}
                        fetchMore={fetchMoreNotifications}
                        hasMore={hasMore}
                        loadingMore={loadingMore}
                        onOpenLink={(link) => { setOpen(null); router.push(link); }}
                    />
                )}

                {open === "profile" && <ProfileDropdown loading={loading} user={user} csrf={csrf} />}
            </div>
        </header>
    );
}

function ProfileDropdown({ loading, user, csrf }: { loading: boolean, user: UserType, csrf: string }) {
    const router: AppRouterInstance = useRouter();
    const { handleLoading, showLoading } = useLoading();
    const { showConfirm, showModal } = useModal();
    const t = useT();

    const onLogout = async () => {
        showConfirm(
            <div className="flex flex-col gap-1">
                <h3 className="text-lg font-semibold">{t('Logout Confirmation')}</h3>
                <p className="text-sm text-gray-500">{t('Are you sure you want to end this session?')}</p>
            </div>,
            async () => {
                await handleLoading(async () => {
                    const response = await logout(csrf);
                    const res: ResponseApi<string> = await response.json();
                    if (res.message == 'Success') {
                        // Navigasi penuh (bukan router.replace) supaya state dan cache router aplikasi ikut hilang.
                        window.location.replace('/login');
                    } else {
                        showModal(
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Login failed</h3>
                                <p className="text-sm text-gray-700">{res.message}</p>
                            </div>
                        );
                    }
                });
            },
            'Yes, Logout',
            'Cancel'
        );
    }

    const handleProfileClick = () => {
        showLoading();
        router.push('/profile');
    };

    return (
        <>
            {loading ? (
                <ProfileDropdownSkeleton />
            ) : (
                <div className="absolute right-0 top-14 w-64 bg-white border border-gray-100 rounded-xl shadow-xl p-2 z-50 animate-in fade-in zoom-in duration-150">
                    <div className="px-3 py-2 border-b border-gray-100 mb-1">
                        <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">{t('Profile Menu')}</p>
                    </div>
                    <div className="px-3 py-3 mb-1 bg-brand-50/50 rounded-lg border border-gray-50">
                        <p className="text-[10px] text-gray-400 leading-none mb-1.5">{t('Logged in as:')}</p>
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-gray-800 truncate">
                                {user.fullName || user.username || 'Username'}
                            </span>
                            <span className="text-xs text-brand-600 font-medium truncate">
                                {(user.roles || []).map(role => role.name).join(', ')}
                            </span>
                        </div>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                        <button
                            className="w-full text-left p-2.5 hover:bg-brand-50 hover:text-brand-600 rounded-lg cursor-pointer transition-all flex items-center gap-2 group"
                            onClick={handleProfileClick}
                        >
                            <div className="w-1.5 h-1.5 rounded-full bg-gray-300 group-hover:bg-brand-400 transition-colors" />
                            {t('Profile')}
                        </button>
                        <div className="px-2.5 py-1.5"><LanguageSwitcher /></div>
                        <button
                            className="w-full text-left p-2.5 hover:bg-red-50 text-red-500 rounded-lg cursor-pointer transition-all font-medium flex items-center gap-2 group"
                            onClick={onLogout}
                        >
                            <div className="w-1.5 h-1.5 rounded-full bg-red-200 group-hover:bg-red-400 transition-colors" />
                            {t('Logout')}
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}

function ProfileDropdownSkeleton() {
    return (
        <div className="absolute right-0 top-14 w-64 bg-white border border-gray-100 rounded-xl shadow-xl p-2 z-50">
            {/* Header Skeleton */}
            <div className="px-3 py-2 border-b border-gray-100 mb-1">
                <div className="h-2 w-20 bg-gray-100 animate-pulse rounded shadow-sm" />
            </div>

            {/* User Info Box Skeleton */}
            <div className="px-3 py-3 mb-1 bg-gray-50/50 rounded-lg border border-gray-50">
                <div className="h-2 w-24 bg-gray-100 animate-pulse rounded mb-2" />
                <div className="flex flex-col gap-2">
                    {/* Name Skeleton */}
                    <div className="h-4 w-40 bg-gray-200 animate-pulse rounded" />
                    {/* Position Skeleton */}
                    <div className="h-3 w-28 bg-gray-100 animate-pulse rounded" />
                </div>
            </div>

            {/* Menu Items Skeleton */}
            <div className="space-y-1">
                {/* Profile Item */}
                <div className="flex items-center gap-2 p-2.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-200 animate-pulse" />
                    <div className="h-4 w-32 bg-gray-100 animate-pulse rounded" />
                </div>

                {/* Logout Item */}
                <div className="flex items-center gap-2 p-2.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-100 animate-pulse" />
                    <div className="h-4 w-16 bg-red-50/50 animate-pulse rounded" />
                </div>
            </div>
        </div>
    );
}

const PROFILE_STATUS_VARIANT: Record<string, 'green' | 'gray' | 'red' | 'orange'> = {
    ACTIVED: 'green',
    INACTIVED: 'gray',
    BLOCKED: 'red',
    SUSPEND: 'orange',
    CLOSED: 'gray',
};

function ProfileModal({ user }: { user: UserType }) {
    return (
        <div className="w-full max-w-md mx-auto sm:max-w-lg">
            {/* Header */}
            <h3 className="text-lg sm:text-xl font-bold mb-4 text-brand-700 flex items-center gap-2">
                <UserIcon className="w-5 h-5 sm:w-6 h-6 text-brand-500" />
                User Profile
            </h3>

            {/* Info Grid */}
            <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="overflow-hidden">
                    <span className="block text-xs text-gray-400 uppercase tracking-wider">Username</span>
                    <span className="block text-sm sm:text-base font-semibold text-gray-800 break-all">
                        {user.username}
                    </span>
                </div>
                <div>
                    <span className="block text-xs text-gray-400 uppercase tracking-wider">Status</span>
                    <span className="block text-sm sm:text-base font-semibold text-gray-800">
                        <BadgeComponent variant={PROFILE_STATUS_VARIANT[user.status || ''] || 'gray'}>
                            {user.status}
                        </BadgeComponent>
                    </span>
                </div>
                <div className="overflow-hidden sm:col-span-2">
                    <span className="block text-xs text-gray-400 uppercase tracking-wider">Role</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                        {(user.roles || []).map(role => (
                            <BadgeComponent key={role.id} variant="blue">{role.name}</BadgeComponent>
                        ))}
                        {(user.roles || []).length === 0 && (
                            <span className="text-sm text-gray-400">-</span>
                        )}
                    </div>
                </div>
            </div>

            <p className="text-sm text-gray-400">
                To change your password or set up OTP, open the{' '}
                <span className="font-semibold text-brand-600">Security</span>.
            </p>
        </div>
    );
}

// --- SUB KOMPONEN: NOTIFICATION DROPDOWN (DESAIN ASLI) ---
function NotificationDropdown({
    csrf, setCsrf, notifications, setNotifications, loading, fetchMore, hasMore, loadingMore, onOpenLink
}: {
    csrf: string,
    setCsrf: SetCsrfFn,
    notifications: Notification[],
    setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>,
    loading: boolean,
    fetchMore: () => Promise<void>,
    hasMore: boolean,
    loadingMore: boolean,
    onOpenLink: (link: string) => void
}) {
    const t = useT();
    const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);

    // Menandai terbaca; notifikasi bertautan langsung membuka halaman terkait, selebihnya tampil sebagai detail.
    const showModal = (item: Notification) => {
        const link = item.notificationMessage?.link;
        if (link) {
            onOpenLink(link);
        } else {
            setSelectedNotification(item);
        }
        if (item.status === 0) {
            editNotificationMe({ id: item.id }, csrf, setCsrf);
            const updatedData = notifications.map((n) => n.id === item.id ? { ...n, status: 1 } : n);
            setNotifications(updatedData);
        }
    };

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const target = e.currentTarget;
        const canScroll = target.scrollHeight > target.clientHeight;
        const isBottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 1;
        if (canScroll && isBottom && hasMore) {
            fetchMore();
        }
    };

    return (
        <>
            <div className="absolute right-0 top-14 w-80 bg-white border border-gray-100 rounded-xl shadow-xl p-3 z-50 animate-in fade-in zoom-in duration-150">
                <div className="pb-2 border-b border-gray-200 flex justify-between items-center">
                    <p className="font-semibold text-gray-800 text-sm px-1">{t('Notifications')}</p>
                    {notifications.some(n => n.status === 0) && (
                        <span className="h-2 w-2 bg-red-500 rounded-full animate-pulse" title={t('New message')}></span>
                    )}
                </div>

                <div
                    onScroll={handleScroll}
                    className="mt-2 space-y-1 max-h-80 overflow-y-auto no-scrollbar"
                >
                    {notifications.length > 0 ? (
                        <>
                            {notifications.map((item) => (
                                <div
                                    key={item.id}
                                    onClick={() => showModal(item)}
                                    className={`p-3 rounded-lg transition-all cursor-pointer group flex flex-col relative mb-1
                                        ${item.status === 0
                                            ? 'bg-blue-50 border-l-4 border-brand-500 shadow-sm'
                                            : 'bg-gray-50/40 hover:bg-white border-l-4 border-transparent hover:shadow-md hover:scale-[1.01] border border-gray-100/50'
                                        }`}
                                >
                                    <div className="flex justify-between items-start gap-2">
                                        <p className={`text-sm transition-colors
                                            ${item.status === 0
                                                ? 'font-bold text-gray-900 group-hover:text-brand-600'
                                                : 'font-normal text-gray-500 group-hover:text-gray-800'}`}>
                                            {item?.notificationMessage?.title}
                                        </p>

                                        {item.status === 0 ? (
                                            <span className="text-[9px] bg-brand-100 text-brand-600 px-1.5 py-0.5 rounded-full font-bold animate-pulse">
                                                <Eye />
                                            </span>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-300 group-hover:text-green-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        )}
                                    </div>

                                    {item.notificationMessage?.message && (
                                        <p className="mt-0.5 line-clamp-2 text-xs text-gray-500">{item.notificationMessage.message}</p>
                                    )}
                                    <p className="mt-1 text-[10px] text-gray-400 group-hover:text-gray-500 flex items-center gap-1">
                                        <span className={`${item.status === 0 ? 'text-brand-400' : 'text-gray-300'}`}>●</span>
                                        {formatTimeAgo(item.registered || '')}
                                    </p>
                                </div>
                            ))}
                            {loadingMore && (
                                <div className="py-2 flex justify-center">
                                    <div className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            )}
                        </>
                    ) : loading ? (
                        <NotificationSkeleton />
                    ) : (
                        <div className="py-8 text-center text-sm text-gray-400">{t('No notifications')}</div>
                    )}
                </div>
            </div>

            {/* Modal Detail (DESAIN ASLI) */}
            {selectedNotification && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform animate-in zoom-in-95 duration-200">
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-xl font-bold text-gray-900">{t('Notification Details')}</h3>
                                <button
                                    onClick={() => setSelectedNotification(null)}
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">{t('Title')}</label>
                                    <p className="text-lg font-semibold text-brand-600">{selectedNotification.notificationMessage?.title}</p>
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">{t('Message')}</label>
                                    <p className="text-gray-700 leading-relaxed">{selectedNotification.notificationMessage?.message || 'No message content.'}</p>
                                </div>
                                <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                                    <span className="text-[11px] text-gray-400 italic">
                                        {formatDate(selectedNotification.registered || '', 'DD/MM/YYYY HH:mm:ss')}
                                    </span>
                                    <button
                                        onClick={() => setSelectedNotification(null)}
                                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors cursor-pointer"
                                    >
                                        {t('Close')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

function NotificationSkeleton() {
    return (
        <div className="space-y-1">
            {[1, 2, 3].map((i) => (
                <div key={i} className="p-3 flex items-start gap-3">
                    <div className="h-8 w-8 bg-gray-100 animate-pulse rounded-lg" />
                    <div className="flex-1 space-y-2">
                        <div className="h-3.5 w-full bg-gray-100 animate-pulse rounded" />
                        <div className="h-2.5 w-1/2 bg-gray-50 animate-pulse rounded" />
                    </div>
                </div>
            ))}
        </div>
    );
}