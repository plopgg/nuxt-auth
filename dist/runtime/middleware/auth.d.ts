type MiddlewareMeta = boolean | {
    /** Whether to only allow unauthenticated users to access this page.
     *
     * Authenticated users will be redirected to `/` or the route defined in `navigateAuthenticatedTo`
     *
     * @default undefined
     */
    unauthenticatedOnly?: boolean;
    /** Where to redirect authenticated users if `unauthenticatedOnly` is set to true
     *
     * @default undefined
     */
    navigateAuthenticatedTo?: string;
    /** Where to redirect unauthenticated users if this page is protected
     *
     * @default undefined
     */
    navigateUnauthenticatedTo?: string;
};
declare module '#app' {
    interface PageMeta {
        auth?: MiddlewareMeta;
    }
}
declare module 'vue-router' {
    interface RouteMeta {
        auth?: MiddlewareMeta;
    }
}
declare const _default: any;
export default _default;
