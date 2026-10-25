'use client';

import { useEffect, useState } from "react";
import HeaderComponent from "@/component/layout/HeaderComponent";
import SidebarComponent from "@/component/layout/SidebarComponent";
import DownloadQueueTray from "@/component/download/DownloadQueueTray";
import { UserProvider } from "@/context/UserContext";
import { DownloadQueueProvider } from "@/context/DownloadQueueContext";
import { Menu } from "@/type/menu";
import { usePathname, useRouter } from "next/navigation";
import { PAGE_FORBIDDEN, PAGE_PROFILE, PUBLIC_PAGES } from "@/utils/endpointUtils";
import ErrorBoundary from "@/component/ui/ErrorBoundary";
import MaintenanceBanner from "@/component/maintenance/MaintenanceBanner";
import AnnouncementBanner from "@/component/announcement/AnnouncementBanner";
import PrivacyBanner from "@/component/privacy/PrivacyBanner";
import SearchPalette from "@/component/layout/SearchPalette";

export default function AdminLayout({ children }: { children: React.ReactNode; }) {
    const router = useRouter();
    const pathname = usePathname();
    const [menus, setMenus] = useState<Menu[]>([]);
    const [hovered, setHovered] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [collapsed, setCollapsed] = useState(true);
    const [searchOpen, setSearchOpen] = useState(false);

    // Ctrl+K (Cmd+K on a Mac) opens or closes the search from any page.
    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
                event.preventDefault();
                setSearchOpen((open) => !open);
            }
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, []);

    // A page restored from the back/forward cache runs nothing again; reload so the session is checked again
    // (without a session, the proxy redirects to login).
    useEffect(() => {
        const onPageShow = (event: PageTransitionEvent) => {
            if (event.persisted) {
                window.location.reload();
            }
        };
        window.addEventListener('pageshow', onPageShow);
        return () => window.removeEventListener('pageshow', onPageShow);
    }, []);

    useEffect(() => {
        if (menus.length === 0) {
            return;
        }

        if (!pathname) {
            return;
        }

        const isPublicPage = PUBLIC_PAGES.includes(pathname);
        if (isPublicPage) {
            return;
        }

        // Profile page is always accessible to any logged-in user
        if (pathname === PAGE_PROFILE) {
            return;
        }

        const hasAccess = menus.some((menu) => {
            return menu.url !== "#" && menu.url === pathname;
        });

        if (!hasAccess) {
            router.push(PAGE_FORBIDDEN);
        }
    }, [menus, pathname, router]);

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            setCollapsed(mobile);
        };
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const isExpanded = isMobile
        ? !collapsed
        : !collapsed || hovered;

    return (
        <UserProvider>
            <DownloadQueueProvider>
                <div className="flex h-screen overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 font-sans">
                    {/* The width in the page flow only changes when the menu button is pressed; opening the sidebar because the
                        cursor passes over it only overlays the content (no page re-layout and no chart redraw). */}
                    <div className={`relative shrink-0 transition-[width] duration-300 ease-in-out ${isMobile ? "w-0" : collapsed ? "w-20" : "w-64"}`}>
                        <SidebarComponent
                            menus={menus}
                            collapsed={!isExpanded}
                            isMobile={isMobile}
                            onHover={setHovered}
                            setMenus={setMenus}
                        />
                    </div>
                    {isMobile && isExpanded && (
                        <div
                            onClick={() => setCollapsed(true)}
                            className="fixed inset-0 bg-black/30 z-40"
                        />
                    )}
                    <div className="flex-1 flex flex-col min-w-0">
                        <div className="shrink-0">
                            <HeaderComponent toggle={() => setCollapsed(!collapsed)} onSearch={() => setSearchOpen(true)} />
                            <MaintenanceBanner />
                            <AnnouncementBanner />
                            <PrivacyBanner />
                        </div>

                        <main className="flex-1 p-6 overflow-auto">
                            <ErrorBoundary>
                                {children}
                            </ErrorBoundary>
                        </main>
                    </div>
                </div>
                <DownloadQueueTray />
                {searchOpen && <SearchPalette menus={menus} onClose={() => setSearchOpen(false)} />}
            </DownloadQueueProvider>
        </UserProvider>
    );
}