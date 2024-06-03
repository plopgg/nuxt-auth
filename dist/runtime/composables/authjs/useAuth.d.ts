import type { AppProvider, BuiltInProviderType } from 'next-auth/providers/index';
import type { CommonUseAuthReturn, SignOutFunc, GetSessionFunc, SignInFunc } from '../../types';
import type { SessionData } from './useAuthState';
/**
 * Utility type that allows autocompletion for a mix of literal, primitiva and non-primitive values.
 * @source https://github.com/microsoft/TypeScript/issues/29729#issuecomment-832522611
 */
type LiteralUnion<T extends U, U = string> = T | (U & Record<never, never>);
export type SupportedProviders = LiteralUnion<BuiltInProviderType> | undefined;
/**
 * Get the current Cross-Site Request Forgery token.
 *
 * You can use this to pass along for certain requests, most of the time you will not need it.
 */
declare const getCsrfToken: () => Promise<string>;
/**
 * Trigger a sign in flow for the passed `provider`. If no provider is given the sign in page for all providers will be shown.
 *
 * @param provider - Provider to trigger sign in flow for. Leave empty to show page with all providers
 * @param options - Sign in options, everything you pass here will be passed with the body of the sign-in request. You can use this to include provider-specific data, e.g., the username and password for the `credential` flow
 * @param authorizationParams - Everything you put in here is passed along as url-parameters in the sign-in request. https://github.com/nextauthjs/next-auth/blob/733fd5f2345cbf7c123ba8175ea23506bcb5c453/packages/next-auth/src/react/types.ts#L44-L49
 */
type SignInResult = void | {
    error: string | null;
    status: number;
    ok: boolean;
    url: any;
};
declare const signIn: SignInFunc<SupportedProviders, SignInResult>;
/**
 * Get all configured providers from the backend. You can use this method to build your own sign-in page.
 */
declare const getProviders: () => Promise<Record<LiteralUnion<BuiltInProviderType, string>, Omit<AppProvider, "options"> | undefined>>;
/**
 * Refresh and get the current session data.
 *
 * @param getSessionOptions - Options for getting the session, e.g., set `required: true` to enforce that a session _must_ exist, the user will be directed to a login page otherwise.
 */
declare const getSession: GetSessionFunc<SessionData>;
/**
 * Sign out the current user.
 *
 * @param options - Options for sign out, e.g., to `redirect` the user to a specific page after sign out has completed
 */
declare const signOut: SignOutFunc;
interface UseAuthReturn extends CommonUseAuthReturn<typeof signIn, typeof signOut, typeof getSession, SessionData> {
    getCsrfToken: typeof getCsrfToken;
    getProviders: typeof getProviders;
}
export declare const useAuth: () => UseAuthReturn;
export default useAuth;
