import { type Ref } from 'vue';
import type { CommonUseAuthReturn, SignOutFunc, SignInFunc, GetSessionFunc, SecondarySignInOptions, SignUpOptions } from '../../types';
import type { SessionData } from '#auth';
type Credentials = {
    username?: string;
    email?: string;
    password?: string;
} & Record<string, any>;
declare const signIn: SignInFunc<Credentials, any>;
declare const signOut: SignOutFunc;
declare const getSession: GetSessionFunc<SessionData | null | void>;
declare const signUp: (credentials: Credentials, signInOptions?: SecondarySignInOptions, signUpOptions?: SignUpOptions) => Promise<any>;
interface UseAuthReturn extends CommonUseAuthReturn<typeof signIn, typeof signOut, typeof getSession, SessionData> {
    signUp: typeof signUp;
    token: Readonly<Ref<string | null>>;
}
export declare const useAuth: () => UseAuthReturn;
export {};
