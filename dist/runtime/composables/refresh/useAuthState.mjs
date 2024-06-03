import { computed, watch } from "vue";
import { useTypedBackendConfig } from "../../helpers.mjs";
import { useAuthState as useLocalAuthState } from "../local/useAuthState.mjs";
import { useRuntimeConfig, useCookie, useState } from "#imports";
export const useAuthState = () => {
  const config = useTypedBackendConfig(useRuntimeConfig(), "refresh");
  const localAuthState = useLocalAuthState();
  const _rawRefreshTokenCookie = useCookie(
    config.refreshToken.cookieName,
    {
      default: () => null,
      domain: config.refreshToken.cookieDomain,
      maxAge: config.refreshToken.maxAgeInSeconds,
      sameSite: "lax",
      secure: config.refreshToken.secureCookieAttribute
    }
  );
  const rawRefreshToken = useState(
    "auth:raw-refresh-token",
    () => _rawRefreshTokenCookie.value
  );
  watch(rawRefreshToken, () => {
    _rawRefreshTokenCookie.value = rawRefreshToken.value;
  });
  const refreshToken = computed(() => {
    if (rawRefreshToken.value === null) {
      return null;
    }
    return rawRefreshToken.value;
  });
  const schemeSpecificState = {
    refreshToken,
    rawRefreshToken
  };
  return {
    ...localAuthState,
    ...schemeSpecificState
  };
};
export default useAuthState;
