import { computed } from "vue";
import getURL from "requrl";
import { joinURL } from "ufo";
import { useRuntimeConfig, useRequestEvent, useState } from "#imports";
export const makeCommonAuthState = () => {
  const data = useState("auth:data", () => void 0);
  const hasInitialSession = computed(() => !!data.value);
  const lastRefreshedAt = useState("auth:lastRefreshedAt", () => {
    if (hasInitialSession.value) {
      return /* @__PURE__ */ new Date();
    }
    return void 0;
  });
  const loading = useState("auth:loading", () => false);
  const status = computed(() => {
    if (loading.value) {
      return "loading";
    } else if (data.value) {
      return "authenticated";
    } else {
      return "unauthenticated";
    }
  });
  let baseURL;
  const { origin, pathname, fullBaseUrl } = useRuntimeConfig().public.auth.computed;
  if (origin) {
    baseURL = fullBaseUrl;
  } else {
    const determinedOrigin = getURL(useRequestEvent()?.node.req, false);
    baseURL = joinURL(determinedOrigin, pathname);
  }
  return {
    data,
    loading,
    lastRefreshedAt,
    status,
    _internal: {
      baseURL,
      pathname
    }
  };
};
