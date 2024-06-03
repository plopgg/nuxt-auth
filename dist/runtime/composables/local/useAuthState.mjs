import { computed, watch } from "vue";
import { makeCommonAuthState } from "../commonAuthState.mjs";
import { useTypedBackendConfig } from "../../helpers.mjs";
import { formatToken } from "../../utils/local.mjs";
import { useRuntimeConfig, useCookie, useState, onMounted } from "#imports";
export const useAuthState = () => {
  const config = useTypedBackendConfig(useRuntimeConfig(), "local");
  const commonAuthState = makeCommonAuthState();
  const _rawTokenCookie = useCookie(config.token.cookieName, {
    default: () => null,
    domain: config.token.cookieDomain,
    maxAge: config.token.maxAgeInSeconds,
    sameSite: config.token.sameSiteAttribute,
    secure: config.token.secureCookieAttribute
  });
  const rawToken = useState("auth:raw-token", () => _rawTokenCookie.value);
  watch(rawToken, () => {
    _rawTokenCookie.value = rawToken.value;
  });
  const token = computed(() => formatToken(rawToken.value));
  const setToken = (newToken) => {
    rawToken.value = newToken;
  };
  const clearToken = () => {
    setToken(null);
  };
  const schemeSpecificState = {
    token,
    rawToken
  };
  onMounted(() => {
    if (_rawTokenCookie.value && !rawToken.value) {
      setToken(_rawTokenCookie.value);
    }
  });
  return {
    ...commonAuthState,
    ...schemeSpecificState,
    setToken,
    clearToken,
    _internal: {
      ...commonAuthState._internal,
      rawTokenCookie: _rawTokenCookie
    }
  };
};
export default useAuthState;
