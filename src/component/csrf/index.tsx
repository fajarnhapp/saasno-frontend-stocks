import { cookies } from "next/headers";
import { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";
import { createCsrfHeader, CSRF_COOKIE_NAME } from "@/utils/csrfUtils";

export default async function Csrf() {
    const cookieStore: ReadonlyRequestCookies = await cookies();
    const csrfCookie: string = cookieStore.get(CSRF_COOKIE_NAME)?.value || '';
    const csrfHeader: string = await createCsrfHeader(csrfCookie);

    return (
        <div
            id="constants"
            data-anonymous="false"
            data-csrf={csrfHeader}
            data-hydrated="true"
        />
    );
}
