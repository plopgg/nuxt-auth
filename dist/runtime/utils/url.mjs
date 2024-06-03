import { joinURL } from "ufo";
import getURL from "requrl";
import { sendRedirect } from "h3";
import { useRequestEvent, useNuxtApp, abortNavigation, useAuthState } from "#imports";
export const getRequestURL = (includePath = true) => getURL(useRequestEvent()?.node.req, includePath);
export function joinPathToApiURL(path) {
  const authStateInternal = useAuthState()._internal;
  const base = path.startsWith("/") ? authStateInternal.pathname : authStateInternal.baseURL;
  return joinURL(base, path);
}
export const navigateToAuthPages = (href) => {
  const nuxtApp = useNuxtApp();
  if (import.meta.server) {
    if (nuxtApp.ssrContext && nuxtApp.ssrContext.event) {
      return nuxtApp.callHook("app:redirected").then(() => {
        sendRedirect(nuxtApp.ssrContext.event, href, 302);
        abortNavigation();
      });
    }
  }
  window.location.href = href;
  if (href.includes("#")) {
    window.location.reload();
  }
  const router = nuxtApp.$router;
  const waitForNavigationWithFallbackToRouter = new Promise((resolve) => setTimeout(resolve, 60 * 1e3)).then(() => router.push(href));
  return waitForNavigationWithFallbackToRouter;
};
export const determineCallbackUrl = (authConfig, getOriginalTargetPath) => {
  const authConfigCallbackUrl = typeof authConfig.globalAppMiddleware === "object" ? authConfig.globalAppMiddleware.addDefaultCallbackUrl : void 0;
  if (typeof authConfigCallbackUrl !== "undefined") {
    if (typeof authConfigCallbackUrl === "string") {
      return authConfigCallbackUrl;
    }
    if (typeof authConfigCallbackUrl === "boolean") {
      if (authConfigCallbackUrl) {
        return getOriginalTargetPath();
      }
    }
  } else if (authConfig.globalAppMiddleware === true) {
    return getOriginalTargetPath();
  }
};
