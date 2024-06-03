import { _fetch } from "../utils/fetch.mjs";
import { jsonPointerGet, objectFromJsonPointer, useTypedBackendConfig } from "../helpers.mjs";
import { defineNuxtPlugin, useAuthState, useRuntimeConfig } from "#imports";
export default defineNuxtPlugin({
  name: "refresh-token-plugin",
  enforce: "pre",
  async setup(nuxtApp) {
    const { rawToken, rawRefreshToken, refreshToken, token, lastRefreshedAt } = useAuthState();
    if (refreshToken.value && token.value) {
      const config = nuxtApp.$config.public.auth;
      const configToken = useTypedBackendConfig(useRuntimeConfig(), "refresh");
      const provider = config.provider;
      const { path, method } = provider.endpoints.refresh;
      const refreshRequestTokenPointer = provider.refreshToken.refreshRequestTokenPointer;
      const headers = new Headers({
        [configToken.token.headerName]: token.value
      });
      try {
        const response = await _fetch(nuxtApp, path, {
          method,
          body: objectFromJsonPointer(refreshRequestTokenPointer, refreshToken.value),
          headers
        });
        const extractedToken = jsonPointerGet(
          response,
          provider.token.signInResponseTokenPointer
        );
        if (typeof extractedToken !== "string") {
          console.error(
            `Auth: string token expected, received instead: ${JSON.stringify(
              extractedToken
            )}. Tried to find token at ${provider.token.signInResponseTokenPointer} in ${JSON.stringify(response)}`
          );
          return;
        }
        if (!configToken.refreshOnlyToken) {
          const extractedRefreshToken = jsonPointerGet(
            response,
            provider.refreshToken.signInResponseRefreshTokenPointer
          );
          if (typeof extractedRefreshToken !== "string") {
            console.error(
              `Auth: string token expected, received instead: ${JSON.stringify(
                extractedRefreshToken
              )}. Tried to find token at ${provider.refreshToken.signInResponseRefreshTokenPointer} in ${JSON.stringify(response)}`
            );
            return;
          } else {
            rawRefreshToken.value = extractedRefreshToken;
          }
        }
        rawToken.value = extractedToken;
        lastRefreshedAt.value = /* @__PURE__ */ new Date();
      } catch (err) {
        rawRefreshToken.value = null;
        rawToken.value = null;
      }
    }
  }
});
