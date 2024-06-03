import { useRuntimeConfig, useAuth, useAuthState } from "#imports";
const defaultRefreshHandler = {
  // Session configuration keep this for reference
  config: void 0,
  // Refetch interval
  refetchIntervalTimer: void 0,
  // TODO: find more Generic method to start a Timer for the Refresh Token
  // Refetch interval for local/refresh schema
  refreshTokenIntervalTimer: void 0,
  visibilityHandler() {
    if (this.config?.enableRefreshOnWindowFocus && document.visibilityState === "visible") {
      useAuth().getSession();
    }
  },
  init(config) {
    this.config = config;
    const runtimeConfig = useRuntimeConfig().public.auth;
    const { data } = useAuthState();
    const { getSession } = useAuth();
    document.addEventListener("visibilitychange", this.visibilityHandler, false);
    const { enableRefreshPeriodically } = config;
    if (enableRefreshPeriodically !== false) {
      const intervalTime = enableRefreshPeriodically === true ? 1e3 : enableRefreshPeriodically;
      this.refetchIntervalTimer = setInterval(() => {
        if (data.value) {
          getSession();
        }
      }, intervalTime);
    }
    if (runtimeConfig.provider.type === "refresh") {
      const intervalTime = runtimeConfig.provider.token.maxAgeInSeconds * 1e3;
      const { refresh, refreshToken } = useAuth();
      this.refreshTokenIntervalTimer = setInterval(() => {
        if (refreshToken.value) {
          refresh();
        }
      }, intervalTime);
    }
  },
  destroy() {
    document.removeEventListener("visibilitychange", this.visibilityHandler, false);
    clearInterval(this.refetchIntervalTimer);
    if (this.refreshTokenIntervalTimer) {
      clearInterval(this.refreshTokenIntervalTimer);
    }
  }
};
export default defaultRefreshHandler;
