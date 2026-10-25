'use client';

import { Context, createContext, ReactNode, useContext } from 'react';
import { AppSetting } from '@/type/app-setting';
import { DEFAULT_APP_SETTING } from '@/utils/appSettingUtils';

const AppSettingContext: Context<AppSetting> = createContext<AppSetting>(DEFAULT_APP_SETTING);

export const useAppSetting: () => AppSetting = (): AppSetting => useContext(AppSettingContext);

// The setting is read once per page load on the server (see app/layout.tsx); changing it is followed by a reload.
export const AppSettingProvider = ({ value, children }: { value: AppSetting; children: ReactNode }) => (
    <AppSettingContext.Provider value={value}>{children}</AppSettingContext.Provider>
);
