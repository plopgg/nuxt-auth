import { type RouteOptions } from '../types';
/**
 * Removes query params from url path.
 */
export declare const withoutQuery: (path: string) => string;
/**
 * Creates a route matcher using the user's paths.
 *
 * In the returned function, enter a path to retrieve the routeRules that applies to that page.
 */
export declare const getNitroRouteRules: (path: string) => Partial<RouteOptions>;
