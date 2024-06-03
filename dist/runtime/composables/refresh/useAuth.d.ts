import type { Ref } from 'vue';
import { useAuth as useLocalAuth } from '../local/useAuth';
declare const refresh: () => Promise<void>;
type UseAuthReturn = ReturnType<typeof useLocalAuth> & {
    refreshToken: Readonly<Ref<string | null>>;
    refresh: () => ReturnType<typeof refresh>;
};
export declare const useAuth: () => UseAuthReturn;
export {};
