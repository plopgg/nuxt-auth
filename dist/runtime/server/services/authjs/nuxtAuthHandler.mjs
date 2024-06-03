import { getQuery, setCookie, readBody, sendRedirect, eventHandler, parseCookies, createError, isMethod, getHeaders, getResponseHeader, setResponseHeader } from "h3";
import { AuthHandler } from "next-auth/core";
import { getToken as nextGetToken } from "next-auth/jwt";
import { defu } from "defu";
import { joinURL } from "ufo";
import { ERROR_MESSAGES } from "../errors.mjs";
import { isNonEmptyObject } from "../../../utils/checkSessionResult.mjs";
import { getServerOrigin, getRequestURLFromRequest } from "../utils.mjs";
import { useTypedBackendConfig } from "../../../helpers.mjs";
import { useRuntimeConfig } from "#imports";
let preparedAuthHandler;
let usedSecret;
const SUPPORTED_ACTIONS = ["providers", "session", "csrf", "signin", "signout", "callback", "verify-request", "error", "_log"];
const useConfig = () => useTypedBackendConfig(useRuntimeConfig(), "authjs");
const readBodyForNext = async (event) => {
  let body;
  if (isMethod(event, ["PATCH", "POST", "PUT", "DELETE"])) {
    body = await readBody(event);
  }
  return body;
};
const parseActionAndProvider = ({ context }) => {
  const params = context.params?._?.split("/");
  if (!params || ![1, 2].includes(params.length)) {
    throw createError({ statusCode: 400, statusMessage: `Invalid path used for auth-endpoint. Supply either one path parameter (e.g., \`/api/auth/session\`) or two (e.g., \`/api/auth/signin/github\` after the base path (in previous examples base path was: \`/api/auth/\`. Received \`${params}\`` });
  }
  const [unvalidatedAction, providerId] = params;
  const action = SUPPORTED_ACTIONS.find((action2) => action2 === unvalidatedAction);
  if (!action) {
    throw createError({ statusCode: 400, statusMessage: `Called endpoint with unsupported action ${unvalidatedAction}. Only the following actions are supported: ${SUPPORTED_ACTIONS.join(", ")}` });
  }
  return { action, providerId };
};
export const NuxtAuthHandler = (nuxtAuthOptions) => {
  const isProduction = process.env.NODE_ENV === "production";
  usedSecret = nuxtAuthOptions?.secret;
  if (!usedSecret) {
    if (isProduction) {
      throw new Error(ERROR_MESSAGES.NO_SECRET);
    } else {
      console.info(ERROR_MESSAGES.NO_SECRET);
      usedSecret = "secret";
    }
  }
  const options = defu(nuxtAuthOptions, {
    secret: usedSecret,
    logger: void 0,
    providers: [],
    trustHost: useConfig().trustHost
  });
  const getInternalNextAuthRequestData = async (event) => {
    const nextRequest = {
      host: getRequestURLFromRequest(event, { trustHost: useConfig().trustHost }),
      body: void 0,
      cookies: parseCookies(event),
      query: void 0,
      headers: getHeaders(event),
      method: event.method,
      providerId: void 0,
      error: void 0
    };
    if (event.context.checkSessionOnNonAuthRequest === true) {
      return {
        ...nextRequest,
        method: "GET",
        action: "session"
      };
    }
    const query = getQuery(event);
    const { action, providerId } = parseActionAndProvider(event);
    const error = query.error;
    if (Array.isArray(error)) {
      throw createError({ statusCode: 400, statusMessage: "Error query parameter can only appear once" });
    }
    const body = await readBodyForNext(event);
    return {
      ...nextRequest,
      body,
      query,
      action,
      providerId,
      error: String(error) || void 0
    };
  };
  const handler = eventHandler(async (event) => {
    const { res } = event.node;
    const nextRequest = await getInternalNextAuthRequestData(event);
    const nextResult = await AuthHandler({
      req: nextRequest,
      options
    });
    if (nextResult.status) {
      res.statusCode = nextResult.status;
    }
    nextResult.cookies?.forEach((cookie) => setCookieDeduped(event, cookie.name, cookie.value, cookie.options));
    nextResult.headers?.forEach((header) => appendHeaderDeduped(event, header.key, header.value));
    if (!nextResult.redirect) {
      return nextResult.body;
    }
    if (nextRequest.body?.json) {
      return { url: nextResult.redirect };
    }
    return sendRedirect(event, nextResult.redirect);
  });
  if (preparedAuthHandler) {
    console.warn("You setup the auth handler for a second time - this is likely undesired. Make sure that you only call `NuxtAuthHandler( ... )` once");
  }
  preparedAuthHandler = handler;
  return handler;
};
export const getServerSession = async (event) => {
  const authBasePath = useRuntimeConfig().public.auth.computed.pathname;
  if (event.path && event.path.startsWith(authBasePath)) {
    return null;
  }
  if (!preparedAuthHandler) {
    const headers = getHeaders(event);
    await $fetch(joinURL(authBasePath, "/session"), { headers }).catch((error) => error.data);
    if (!preparedAuthHandler) {
      throw createError({ statusCode: 500, statusMessage: "Tried to get server session without setting up an endpoint to handle authentication (see https://github.com/sidebase/nuxt-auth#quick-start)" });
    }
  }
  event.context.checkSessionOnNonAuthRequest = true;
  const session = await preparedAuthHandler(event);
  delete event.context.checkSessionOnNonAuthRequest;
  if (isNonEmptyObject(session)) {
    return session;
  }
  return null;
};
export const getToken = ({ event, secureCookie, secret, ...rest }) => nextGetToken({
  // @ts-expect-error As our request is not a real next-auth request, we pass down only what's required for the method, as per code from https://github.com/nextauthjs/next-auth/blob/8387c78e3fef13350d8a8c6102caeeb05c70a650/packages/next-auth/src/jwt/index.ts#L68
  req: {
    cookies: parseCookies(event),
    headers: getHeaders(event)
  },
  // see https://github.com/nextauthjs/next-auth/blob/8387c78e3fef13350d8a8c6102caeeb05c70a650/packages/next-auth/src/jwt/index.ts#L73
  secureCookie: secureCookie ?? getServerOrigin(event).startsWith("https://"),
  secret: secret || usedSecret,
  ...rest
});
function appendHeaderDeduped(event, name, value) {
  let current = getResponseHeader(event, name);
  if (!current) {
    setResponseHeader(event, name, value);
    return;
  }
  if (!Array.isArray(current)) {
    current = [current.toString()];
  }
  if (current.includes(value)) {
    return;
  }
  current.push(value);
  setResponseHeader(event, name, current);
}
function setCookieDeduped(event, name, value, serializeOptions) {
  let setCookiesHeader = getResponseHeader(event, "set-cookie");
  if (setCookiesHeader) {
    if (!Array.isArray(setCookiesHeader)) {
      setCookiesHeader = [setCookiesHeader.toString()];
    }
    const filterBy = `${name}=`;
    setCookiesHeader = setCookiesHeader.filter((cookie) => !cookie.startsWith(filterBy));
    setResponseHeader(event, "set-cookie", setCookiesHeader);
  }
  setCookie(event, name, value, serializeOptions);
}
