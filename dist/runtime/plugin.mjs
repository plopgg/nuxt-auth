import { getHeader } from "h3";
import authMiddleware from "./middleware/auth.mjs";
import defaultRefreshHandler from "./utils/refreshHandler.mjs";
import { getNitroRouteRules } from "./utils/kit.mjs";
import { addRouteMiddleware, defineNuxtPlugin, useRuntimeConfig, useAuth, useAuthState } from "#imports";
export default defineNuxtPlugin(async (nuxtApp) => {
  const { data, lastRefreshedAt, loading } = useAuthState();
  const { getSession } = useAuth();
  const runtimeConfig = useRuntimeConfig().public.auth;
  const routeRules = getNitroRouteRules(nuxtApp._route.path);
  let nitroPrerender = false;
  if (nuxtApp.ssrContext) {
    nitroPrerender = getHeader(nuxtApp.ssrContext.event, "x-nitro-prerender") !== void 0;
  }
  let disableServerSideAuth = routeRules.disableServerSideAuth;
  disableServerSideAuth ??= runtimeConfig?.disableServerSideAuth;
  disableServerSideAuth ??= false;
  if (disableServerSideAuth) {
    loading.value = true;
  }
  if (typeof data.value === "undefined" && !nitroPrerender && !disableServerSideAuth) {
    await getSession();
  }
  const refreshHandler = typeof runtimeConfig.session.refreshHandler === "undefined" ? defaultRefreshHandler : runtimeConfig.session.refreshHandler;
  nuxtApp.hook("app:mounted", () => {
    refreshHandler.init(runtimeConfig.session);
    if (disableServerSideAuth) {
      getSession();
    }
  });
  const _unmount = nuxtApp.vueApp.unmount;
  nuxtApp.vueApp.unmount = function() {
    refreshHandler.destroy();
    lastRefreshedAt.value = void 0;
    data.value = void 0;
    _unmount();
  };
  const { globalAppMiddleware } = useRuntimeConfig().public.auth;
  if (globalAppMiddleware === true || typeof globalAppMiddleware === "object" && globalAppMiddleware.isEnabled) {
    addRouteMiddleware("auth", authMiddleware, {
      global: true
    });
  }
});
