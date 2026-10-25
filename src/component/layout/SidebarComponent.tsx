'use client';

import { useEffect, useState, useMemo } from "react";
import {
    LayoutDashboard,
    CalendarDays,
    LayoutGrid,
    Users,
    Server,
    Clipboard,
    Briefcase,
    FileText,
    Settings,
    ShieldCheck,
    ChevronDown,
    History,
    Palette,
    Wrench,
    Bell,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "@/type/menu";
import { useUser } from "@/context/UserContext";
import { useT } from "@/context/LanguageContext";
import { User } from "@/type/user";
import { useLoading } from "@/context/LoadingCircleContext";
import { useAppSetting } from "@/context/AppSettingContext";
import AppLogo from "@/component/ui/AppLogo";

type MenuNode = Menu & { children: Menu[] };

export default function SidebarComponent({
    menus,
    collapsed,
    isMobile,
    onHover,
    setMenus,
}: {
    menus: Menu[];
    collapsed: boolean;
    isMobile: boolean;
    onHover: (v: boolean) => void;
    setMenus: (menus: Menu[]) => void;
}) {
    const { user } = useUser();
    const t = useT();
    const { appName } = useAppSetting();
    const { showLoading } = useLoading();
    const [loading, setLoading] = useState(true);
    const pathname = usePathname();
    const [openMenu, setOpenMenu] = useState<string | null>(null);

    // Tampilkan loading seketika saat pindah ke URL lain; kalau targetnya sama dengan
    // halaman aktif, tidak akan ada perubahan pathname untuk mematikannya lagi.
    const navigate = (url?: string) => {
        if (url && url !== pathname) {
            showLoading();
        }
    };

    function collectMenus(user: User): Menu[] {
        const menuMap = new Map<string, Menu>()

        user.roles?.forEach(role => {
            role.menus?.forEach(menu => {
                if (!menuMap.has(menu.id || '')) {
                    menuMap.set(menu.id || '', menu)
                }
            })
        })

        return Array.from(menuMap.values()).sort(
            (a, b) => (a.orderIndex || 0) - (b.orderIndex || 0)
        )
    }

    useEffect(() => {
        if (user && user.roles) {
            const collected = collectMenus(user);
            setMenus(collected);
            // loading tracks whether `user.roles` has arrived from context, which can't be
            // derived from `user` alone ("not loaded yet" and "loaded with zero roles" both
            // start as the same empty shape).
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setLoading(false);
        }
    }, [user, setMenus]);

    // 1. Mapping Icon Berdasarkan Nama atau String Icon dari DB
    const getIcon = (iconName: string | null | undefined) => {
        switch (iconName) {
            case 'dashboard': return <LayoutDashboard size={20} />;
            case 'calendar': return <CalendarDays size={20} />;
            case 'layout': return <LayoutGrid size={20} />;
            case 'users': return <Users size={20} />;
            case 'api': return <Server size={20} />;
            case 'clipboard': return <Clipboard size={20} />;
            case 'positionrole': return <Briefcase size={20} />;
            case 'papper': return <FileText size={20} />;
            case 'settings': return <Settings size={20} />;
            case 'shield': return <ShieldCheck size={20} />;
            case 'history': return <History size={20} />;
            case 'palette': return <Palette size={20} />;
            case 'wrench': return <Wrench size={20} />;
            case 'bell': return <Bell size={20} />;
            default: return <LayoutDashboard size={20} />; // Icon default untuk sub-menu
        }
    };

    // 2. Transform Flat Data ke Hierarki (Parent & Children)
    const menuItems = useMemo(() => {
        const parents = menus
            .filter(item => !item.parentId)
            .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));

        return parents.map(parent => ({
            ...parent,
            children: menus
                .filter(child => child.parentId === parent.id)
                .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0))
        }));
    }, [menus]);

    // 3. Auto-open dropdown jika ada sub-menu yang aktif berdasarkan URL
    useEffect(() => {
        const activeParent = menuItems.find(parent =>
            parent.children.some(child => child.url === pathname)
        );
        if (activeParent?.id) {
            // Syncs the open dropdown to browser navigation (pathname), but openMenu is also
            // user-togglable by click, so it can't be replaced by a value derived purely from render.
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setOpenMenu(activeParent.id);
        }
    }, [pathname, menuItems]);

    const isActive = (url?: string) => pathname === url;

    const isParentActive = (parent: MenuNode) => {
        if (isActive(parent.url)) return true;
        return parent.children.some((child: Menu) => isActive(child.url));
    };

    return (
        <aside
            onMouseEnter={() => !isMobile && onHover(true)}
            onMouseLeave={() => !isMobile && onHover(false)}
            className={`
                ${isMobile ? "fixed z-50" : "absolute inset-y-0 left-0 z-30"}
                ${collapsed ? "w-20" : "w-64"}
                ${isMobile && (collapsed ? "-translate-x-full" : "translate-x-0")}
                transition-[width,transform] duration-300 ease-in-out
                h-full bg-white flex flex-col
                shadow-[2px_0_10px_rgba(0,0,0,0.08)]
            `}
        >
            {/* Logo Section */}
            <div className="h-16 flex items-center px-4 shrink-0">
                <Link href="/dashboard" onClick={() => navigate("/dashboard")} className={`flex items-center ${collapsed ? "justify-center w-full" : "gap-3"}`}>
                    <AppLogo size={40} />
                    {!collapsed && (
                        <div className="leading-tight truncate">
                            <div className="font-semibold text-sm text-gray-800 truncate">{appName}</div>
                            <div className="text-[10px] text-gray-400 uppercase tracking-wider">System Management</div>
                        </div>
                    )}
                </Link>
            </div>

            {/* Menu Section */}
            <div className="p-4 flex-1 overflow-y-auto no-scrollbar">
                {loading ? (
                    <SidebarSkeleton collapsed={collapsed} />
                ) : (
                    <ul className="space-y-1">
                        {menuItems.map((item) => {
                            const hasChildren = item.children.length > 0;
                            const activeParent = isParentActive(item);

                            const rowColorClass = activeParent
                                ? "bg-brand-50 text-brand-600"
                                : "hover:bg-brand-50 hover:text-brand-600 text-gray-500";

                            return (
                                <div key={item.id}>
                                    {hasChildren ? (
                                        <li
                                            onClick={() => setOpenMenu(openMenu === item.id ? null : item.id!)}
                                            className={`group flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-all duration-200 ${rowColorClass}`}
                                        >
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                <div className={`${activeParent ? "text-brand-600" : "text-gray-400 group-hover:text-brand-600"}`}>
                                                    {getIcon(item.icon)}
                                                </div>
                                                {!collapsed && (
                                                    <span className="text-sm font-medium truncate">{t(item.name)}</span>
                                                )}
                                            </div>

                                            {!collapsed && (
                                                <ChevronDown
                                                    size={16}
                                                    className={`transition-transform duration-300 ${openMenu === item.id ? "rotate-180" : ""}`}
                                                />
                                            )}
                                        </li>
                                    ) : (
                                        // Seluruh baris (ikon + label) jadi satu area klik, bukan cuma teks label.
                                        <li>
                                            <Link
                                                href={item.url || "/not-found"}
                                                onClick={() => navigate(item.url)}
                                                className={`group flex items-center gap-3 overflow-hidden p-2.5 rounded-lg cursor-pointer transition-all duration-200 ${rowColorClass}`}
                                            >
                                                <div className={`${activeParent ? "text-brand-600" : "text-gray-400 group-hover:text-brand-600"}`}>
                                                    {getIcon(item.icon)}
                                                </div>
                                                {!collapsed && (
                                                    <span className="text-sm font-medium truncate">{t(item.name)}</span>
                                                )}
                                            </Link>
                                        </li>
                                    )}

                                    {/* Sub-menu Rendering */}
                                    {hasChildren && openMenu === item.id && !collapsed && (
                                        <ul className="ml-9 mt-1 space-y-1 border-l-2 border-gray-100">
                                            {item.children.map((child) => (
                                                <li key={child.id}>
                                                    <Link
                                                        href={child.url || "#"}
                                                        onClick={() => navigate(child.url)}
                                                        className={`
                                                            block text-xs px-4 py-2 rounded-md transition-all
                                                            ${isActive(child.url)
                                                                ? "text-brand-600 font-semibold"
                                                                : "text-gray-500 hover:text-brand-500 hover:bg-brand-50/50"}
                                                        `}
                                                    >
                                                        {t(child.name)}
                                                    </Link>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            );
                        })}
                    </ul>
                )}
            </div>
        </aside>
    );
}

function SidebarSkeleton({ collapsed }: { collapsed: boolean }) {
    return (
        <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-3">
                    <div className="h-9 w-9 bg-gray-100 animate-pulse rounded-lg shrink-0" />
                    {!collapsed && <div className="h-4 w-full bg-gray-100 animate-pulse rounded" />}
                </div>
            ))}
        </div>
    );
}