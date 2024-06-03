import getURL from "requrl";
import { joinURL } from "ufo";
import { isProduction } from "../../helpers.mjs";
import { ERROR_MESSAGES } from "./errors.mjs";
import { useRuntimeConfig } from "#imports";
export const getServerOrigin = (event) => {
  const envOrigin = process.env.AUTH_ORIGIN;
  if (envOrigin) {
    return envOrigin;
  }
  const runtimeConfigOrigin = useRuntimeConfig().public.auth.computed.origin;
  if (runtimeConfigOrigin) {
    return runtimeConfigOrigin;
  }
  const eventAuthOrigin = event?.context?.AUTH_ORIGIN;
  if (eventAuthOrigin) {
    return eventAuthOrigin;
  }
  if (event && !isProduction) {
    return getURL(event.node.req, false);
  }
  throw new Error(ERROR_MESSAGES.NO_ORIGIN);
};
export const getRequestURLFromRequest = (event, { trustHost }) => {
  if (trustHost) {
    const forwardedValue = getURL(event.node.req);
    if (forwardedValue) {
      return Array.isArray(forwardedValue) ? forwardedValue[0] : forwardedValue;
    }
  }
  let origin;
  try {
    origin = getServerOrigin(event);
  } catch (error) {
    return void 0;
  }
  return joinURL(origin, useRuntimeConfig().public.auth.computed.pathname);
};
