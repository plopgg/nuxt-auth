import { callWithNuxt } from "#app/nuxt";
import { joinPathToApiURL } from "./url.mjs";
export const _fetch = async (nuxt, path, fetchOptions) => {
  try {
    const joinedPath = await callWithNuxt(nuxt, () => joinPathToApiURL(path));
    return $fetch(joinedPath, fetchOptions);
  } catch (error) {
    console.error(
      "Error in `nuxt-auth`-app-side data fetching: Have you added the authentication handler server-endpoint `[...].ts`? Have you added the authentication handler in a non-default location (default is `~/server/api/auth/[...].ts`) and not updated the module-setting `auth.basePath`? Error is:"
    );
    console.error(error);
    throw new Error(
      "Runtime error, checkout the console logs to debug, open an issue at https://github.com/sidebase/nuxt-auth/issues/new/choose if you continue to have this problem"
    );
  }
};
