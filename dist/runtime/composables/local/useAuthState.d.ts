import { type ComputedRef } from 'vue';
import type { CookieRef } from '#app';
import { type CommonUseAuthStateReturn } from '../../types';
import type { SessionData } from '#auth';
interface UseAuthStateReturn extends CommonUseAuthStateReturn<SessionData> {
    token: ComputedRef<string | null>;
    rawToken: CookieRef<string | null>;
    setToken: (newToken: string | null) => void;
    clearToken: () => void;
    _internal: {
        baseURL: string;
        pathname: string;
        rawTokenCookie: CookieRef<string | null>;
    };
}
export declare const useAuthState: () => UseAuthStateReturn;
export default useAuthState;
