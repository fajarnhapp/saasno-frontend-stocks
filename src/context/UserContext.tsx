'use client';

import { readUserMe } from '@/service/userService';
import { User } from '@/type/user';
import { createContext, useContext, useState, ReactNode, useEffect, Context } from 'react';
import { useCsrf } from './CsrfContext';
import { handleResponseApi } from '@/utils/responseApiUtils';
import { ResponseApi } from '@/type/common/ResponseApi';
import { PAGE_CHANGE_PASSWORD, PAGE_SETUP_TWO_FACTOR } from '@/utils/endpointUtils';

interface Properties {
    user: User;
    loading: boolean;
}

const UserContext: Context<Properties> = createContext<Properties>({
    user: {},
    loading: true,
});

export const useUser: () => Properties = (): Properties => useContext(UserContext);

export const UserProvider = ({ children }: { children: ReactNode }) => {
    const { setCsrf } = useCsrf();
    const [user, setUser] = useState<User>({});
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const init = async () => {
            const userResponse = await readUserMe(setCsrf);
            const userData: ResponseApi<User> = await handleResponseApi(userResponse);
            // Every other API answers 403 until the password is changed, so go there first.
            if (userData.data?.passwordChangeRequired) {
                window.location.replace(PAGE_CHANGE_PASSWORD);
                return;
            }
            // Same for two-factor authentication that is required but not set up yet.
            if (userData.data?.twoFactorSetupRequired) {
                window.location.replace(PAGE_SETUP_TWO_FACTOR);
                return;
            }
            setUser(userData.data);
            setLoading(false);
        };
        init();
        // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount only; setCsrf is a stable context setter
    }, []);

    return (
        <UserContext.Provider value={{ user, loading }}>
            {children}
        </UserContext.Provider>
    );
};
