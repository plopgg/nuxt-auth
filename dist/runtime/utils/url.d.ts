import type { ModuleOptionsNormalized } from '../types';
export declare const getRequestURL: (includePath?: boolean) => string;
export declare function joinPathToApiURL(path: string): string;
/**
 * Function to correctly navigate to auth-routes, necessary as the auth-routes are not part of the nuxt-app itself, so unknown to nuxt / vue-router.
 *
 * More specifically, we need this function to correctly handle the following cases:
 * 1. On the client-side, returning `navigateTo(signInUrl)` leads to a `404` error as the next-auth-signin-page was not registered with the vue-router that is used for routing under the hood. For this reason we need to
 *    manually set `window.location.href` on the client **and then fake return a Promise that does not immediately resolve to block navigation (although it will not actually be fully awaited, but just be awaited long enough for the naviation to complete)**.
 * 2. Additionally on the server-side, we cannot use `navigateTo(signInUrl)` as this uses `vue-router` internally which does not know the "external" sign-in page of next-auth and thus will log a warning which we want to avoid.
 *
 * Adapted from: https://github.com/nuxt/framework/blob/ab2456c295fc8c7609a7ef7ca1e47def5d087e87/packages/nuxt/src/app/composables/router.ts#L97-L115
 *
 * @param href HREF / URL to navigate to
 */
export declare const navigateToAuthPages: (href: string) => any;
/**
 * Determins the desired callback url based on the users desires. Either:
 * - uses a hardcoded path the user provided,
 * - determines the callback based on the target the user wanted to reach
 *
 * @param authConfig Authentication runtime module config
 * @param getOriginalTargetPath Function that returns the original location the user wanted to reach
 */
export declare const determineCallbackUrl: <T extends string | Promise<string>>(authConfig: ModuleOptionsNormalized, getOriginalTargetPath: () => T) => T | string | undefined;
