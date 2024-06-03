import { callWithNuxt } from "#app/nuxt";
import { getRequestURL, joinPathToApiURL, navigateToAuthPages } from "./url.mjs";
export const navigateToAuthPageWN = (nuxt, href) => callWithNuxt(nuxt, navigateToAuthPages, [href]);
export const getRequestURLWN = (nuxt) => callWithNuxt(nuxt, getRequestURL);
export const joinPathToApiURLWN = (nuxt, path) => callWithNuxt(nuxt, joinPathToApiURL, [path]);
export const makeCWN = (func) => (nuxt) => callWithNuxt(nuxt, func);
