import type { RefreshHandlerConfig, RefreshHandler } from '../types';
interface DefaultRefreshHandler extends RefreshHandler {
    config?: RefreshHandlerConfig;
    refetchIntervalTimer?: ReturnType<typeof setInterval>;
    refreshTokenIntervalTimer?: ReturnType<typeof setInterval>;
    visibilityHandler(): void;
}
declare const defaultRefreshHandler: DefaultRefreshHandler;
export default defaultRefreshHandler;
