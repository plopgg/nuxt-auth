import { type ComputedRef } from 'vue';
import { type CookieRef } from '#app';
import { useAuthState as useLocalAuthState } from '../local/useAuthState';
type UseAuthStateReturn = ReturnType<typeof useLocalAuthState> & {
    rawRefreshToken: CookieRef<string | null>;
    refreshToken: ComputedRef<string | null>;
};
export declare const useAuthState: () => UseAuthStateReturn;
export default useAuthState;
