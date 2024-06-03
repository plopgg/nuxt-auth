import type { SessionStatus } from '../types';
export declare const makeCommonAuthState: <SessionData>() => {
    data: any;
    loading: any;
    lastRefreshedAt: any;
    status: import("vue").ComputedRef<SessionStatus>;
    _internal: {
        baseURL: any;
        pathname: any;
    };
};
