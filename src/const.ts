import { env } from './env';

export const DEBUG = env.handler.debug;
export const PATH_PREFIX = (env.handler.pathPrefix || '').replace(/^\/+/, '/');
