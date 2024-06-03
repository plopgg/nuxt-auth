import { determineCallbackUrl } from "../utils/url.mjs";
import { navigateTo, defineNuxtRouteMiddleware, useRuntimeConfig, useAuth } from "#imports";
export default defineNuxtRouteMiddleware((to) => {
  const metaAuth = typeof to.meta.auth === "object" ? {
    unauthenticatedOnly: true,
    ...to.meta.auth
  } : to.meta.auth;
  if (metaAuth === false) {
    return;
  }
  const authConfig = useRuntimeConfig().public.auth;
  const { status, signIn } = useAuth();
  const isGuestMode = typeof metaAuth === "object" && metaAuth.unauthenticatedOnly;
  if (isGuestMode && status.value === "unauthenticated") {
    return;
  }
  if (typeof metaAuth === "object" && !metaAuth.unauthenticatedOnly) {
    return;
  }
  if (status.value === "authenticated") {
    if (isGuestMode) {
      return navigateTo(metaAuth.navigateAuthenticatedTo ?? "/");
    }
    return;
  }
  if (authConfig.provider?.type === "local") {
    const loginRoute = authConfig.provider?.pages?.login;
    if (loginRoute && loginRoute === to.path) {
      return;
    }
  }
  const globalAppMiddleware = authConfig.globalAppMiddleware;
  if (globalAppMiddleware === true || typeof globalAppMiddleware === "object" && globalAppMiddleware.allow404WithoutAuth) {
    const matchedRoute = to.matched.length > 0;
    if (!matchedRoute) {
      return;
    }
  }
  if (authConfig.provider.type === "authjs") {
    const signInOptions = { error: "SessionRequired", callbackUrl: determineCallbackUrl(authConfig, () => to.fullPath) };
    return signIn(void 0, signInOptions);
  } else if (typeof metaAuth === "object" && metaAuth.navigateUnauthenticatedTo) {
    return navigateTo(metaAuth.navigateUnauthenticatedTo);
  } else {
    return navigateTo(authConfig.provider.pages.login);
  }
});
