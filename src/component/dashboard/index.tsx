'use client';

import { useUser } from "@/context/UserContext";
import { useAppSetting } from "@/context/AppSettingContext";
import AnnouncementPanel from "@/component/announcement/AnnouncementPanel";

export default function DashboardComponent() {
    const { user } = useUser();
    const { appName } = useAppSetting();
    return (
        <div className="flex w-full flex-col gap-4 lg:w-[calc((100%-1rem)/2)]">
            <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-2">
                    Dashboard
                </h2>
                <p className="text-gray-500">
                    Hello {user?.username || 'there'}, Welcome to {appName} Dashboard 🚀
                </p>
            </div>
            <AnnouncementPanel />
        </div>
    );
}
