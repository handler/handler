import { HTTPContext } from './context';

export type HTTPHandler = (ctx: HTTPContext, next?: () => Promise<void>) => Promise<any>;
