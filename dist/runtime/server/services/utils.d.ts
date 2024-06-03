import { H3Event } from 'h3';
/**
 * Get `origin` and fallback to `x-forwarded-host` or `host` headers if not in production.
 */
export declare const getServerOrigin: (event?: H3Event) => string;
/** Get the request url or construct it */
export declare const getRequestURLFromRequest: (event: H3Event, { trustHost }: {
    trustHost: boolean;
}) => string | undefined;
