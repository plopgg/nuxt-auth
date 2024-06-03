import { defu } from "defu";
import { readonly } from "vue";
import { appendHeader } from "h3";
import { callWithNuxt } from "#app/nuxt";
import { determineCallbackUrl } from "../../utils/url.mjs";
import { makeCWN, joinPathToApiURLWN, navigateToAuthPageWN, getRequestURLWN } from "../../utils/callWithNuxt.mjs";
import { _fetch } from "../../utils/fetch.mjs";
import { isNonEmptyObject } from "../../utils/checkSessionResult.mjs";
import { useTypedBackendConfig } from "../../helpers.mjs";
import { createError, useNuxtApp, useRuntimeConfig, useRequestHeaders, useAuthState } from "#imports";
const getRequestCookies = async (nuxt) => {
  const { cookie } = await callWithNuxt(nuxt, () => useRequestHeaders(["cookie"]));
  if (cookie) {
    return { cookie };
  }
  return {};
};
const getCsrfToken = async () => {
  const nuxt = useNuxtApp();
  const headers = await getRequestCookies(nuxt);
  return _fetch(nuxt, "/csrf", { headers }).then((response) => response.csrfToken);
};
const getCsrfTokenWithNuxt = makeCWN(getCsrfToken);
const signIn = async (provider, options, authorizationParams) => {
  const nuxt = useNuxtApp();
  const configuredProviders = await getProviders();
  if (!configuredProviders) {
    const errorUrl = await joinPathToApiURLWN(nuxt, "error");
    return navigateToAuthPageWN(nuxt, errorUrl);
  }
  const runtimeConfig = await callWithNuxt(nuxt, useRuntimeConfig);
  const backendConfig = useTypedBackendConfig(runtimeConfig, "authjs");
  if (typeof provider === "undefined") {
    provider = backendConfig.defaultProvider;
  }
  const { redirect = true } = options ?? {};
  let { callbackUrl } = options ?? {};
  if (typeof callbackUrl === "undefined" && backendConfig.addDefaultCallbackUrl) {
    callbackUrl = await determineCallbackUrl(runtimeConfig.public.auth, () => getRequestURLWN(nuxt));
  }
  const signinUrl = await joinPathToApiURLWN(nuxt, "signin");
  const queryParams = callbackUrl ? `?${new URLSearchParams({ callbackUrl })}` : "";
  const hrefSignInAllProviderPage = `${signinUrl}${queryParams}`;
  if (!provider) {
    return navigateToAuthPageWN(nuxt, hrefSignInAllProviderPage);
  }
  const selectedProvider = configuredProviders[provider];
  if (!selectedProvider) {
    return navigateToAuthPageWN(nuxt, hrefSignInAllProviderPage);
  }
  const isCredentials = selectedProvider.type === "credentials";
  const isEmail = selectedProvider.type === "email";
  const isSupportingReturn = isCredentials || isEmail;
  let action = "signin";
  if (isCredentials) {
    action = "callback";
  }
  const csrfToken = await callWithNuxt(nuxt, getCsrfToken);
  const headers = {
    "Content-Type": "application/x-www-form-urlencoded",
    ...await getRequestCookies(nuxt)
  };
  const body = new URLSearchParams({
    ...options,
    csrfToken,
    callbackUrl,
    json: true
  });
  const fetchSignIn = () => _fetch(nuxt, `/${action}/${provider}`, {
    method: "post",
    params: authorizationParams,
    headers,
    body
  }).catch((error2) => error2.data);
  const data = await callWithNuxt(nuxt, fetchSignIn);
  if (redirect || !isSupportingReturn) {
    const href = data.url ?? callbackUrl;
    return navigateToAuthPageWN(nuxt, href);
  }
  const error = new URL(data.url).searchParams.get("error");
  await getSessionWithNuxt(nuxt);
  return {
    error,
    status: 200,
    ok: true,
    url: error ? null : data.url
  };
};
const getProviders = () => _fetch(useNuxtApp(), "/providers");
const getSession = async (getSessionOptions) => {
  const nuxt = useNuxtApp();
  const callbackUrlFallback = await getRequestURLWN(nuxt);
  const { required, callbackUrl, onUnauthenticated } = defu(getSessionOptions || {}, {
    required: false,
    callbackUrl: void 0,
    onUnauthenticated: () => signIn(void 0, {
      callbackUrl: getSessionOptions?.callbackUrl || callbackUrlFallback
    })
  });
  const { data, status, loading, lastRefreshedAt } = await callWithNuxt(nuxt, useAuthState);
  const onError = () => {
    loading.value = false;
  };
  const headers = await getRequestCookies(nuxt);
  return _fetch(nuxt, "/session", {
    onResponse: ({ response }) => {
      const sessionData = response._data;
      if (import.meta.server) {
        const setCookieValues = response.headers.getSetCookie ? response.headers.getSetCookie() : [response.headers.get("set-cookie")];
        if (setCookieValues && nuxt.ssrContext) {
          for (const value of setCookieValues) {
            if (!value) {
              continue;
            }
            appendHeader(nuxt.ssrContext.event, "set-cookie", value);
          }
        }
      }
      data.value = isNonEmptyObject(sessionData) ? sessionData : null;
      loading.value = false;
      if (required && status.value === "unauthenticated") {
        return onUnauthenticated();
      }
      return sessionData;
    },
    onRequest: ({ options }) => {
      lastRefreshedAt.value = /* @__PURE__ */ new Date();
      options.params = {
        ...options.params || {},
        callbackUrl: callbackUrl || callbackUrlFallback
      };
    },
    onRequestError: onError,
    onResponseError: onError,
    headers
  });
};
const getSessionWithNuxt = makeCWN(getSession);
const signOut = async (options) => {
  const nuxt = useNuxtApp();
  const requestURL = await getRequestURLWN(nuxt);
  const { callbackUrl = requestURL, redirect = true } = options ?? {};
  const csrfToken = await getCsrfTokenWithNuxt(nuxt);
  if (!csrfToken) {
    throw createError({ statusCode: 400, statusMessage: "Could not fetch CSRF Token for signing out" });
  }
  const callbackUrlFallback = requestURL;
  const signoutData = await _fetch(nuxt, "/signout", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    onRequest: ({ options: options2 }) => {
      options2.body = new URLSearchParams({
        csrfToken,
        callbackUrl: callbackUrl || callbackUrlFallback,
        json: "true"
      });
    }
  }).catch((error) => error.data);
  if (redirect) {
    const url = signoutData.url ?? callbackUrl;
    return navigateToAuthPageWN(nuxt, url);
  }
  await getSessionWithNuxt(nuxt);
  return signoutData;
};
export const useAuth = () => {
  const {
    data,
    status,
    lastRefreshedAt
  } = useAuthState();
  const getters = {
    status,
    data: readonly(data),
    lastRefreshedAt: readonly(lastRefreshedAt)
  };
  const actions = {
    getSession,
    getCsrfToken,
    getProviders,
    signIn,
    signOut
  };
  return {
    ...actions,
    ...getters
  };
};
export default useAuth;
