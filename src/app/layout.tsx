import './globals.css';
import { Inter } from 'next/font/google';
import { NextFontWithVariable } from 'next/dist/compiled/@next/font';
import { CsrfProvider } from '@/context/CsrfContext';
import { LoadingCircleProvider } from '@/context/LoadingCircleContext';
import { ModalProvider } from '@/context/ModalContext';
import { ToastProvider } from '@/context/ToastContext';
import ToastContainer from '@/component/ui/ToastContainer';
import { AppSettingProvider } from '@/context/AppSettingContext';
import { getAppSetting } from '@/utils/appSettingServer';
import { brandCssVariables } from '@/utils/brandUtils';
import { CSSProperties } from 'react';
import { cookies } from 'next/headers';
import { LanguageProvider } from '@/context/LanguageContext';
import { LANGUAGE_COOKIE, toLanguage } from '@/i18n/languages';

// The name, logo and brand colour come from the backend (Application settings), so pages are rendered per request.
export const dynamic = 'force-dynamic';

const inter: NextFontWithVariable = Inter({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter'
});

export default async function RootLayout({ children }: { children: React.ReactNode; }) {
  const setting = await getAppSetting();
  const language = toLanguage((await cookies()).get(LANGUAGE_COOKIE)?.value);
  return (
    <html lang={language} style={brandCssVariables(setting.brandHue, setting.brandChroma) as CSSProperties}>
      <body className={inter.className}>
        <LanguageProvider initial={language}>
        <AppSettingProvider value={setting}>
          <LoadingCircleProvider>
            <ModalProvider>
              <ToastProvider>
                <CsrfProvider>
                  {children}
                </CsrfProvider>
                <ToastContainer />
              </ToastProvider>
            </ModalProvider>
          </LoadingCircleProvider>
        </AppSettingProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}