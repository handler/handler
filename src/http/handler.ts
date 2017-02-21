import { HTTPContext } from './context';

export type HTTPHandler = (ctx: HTTPContext, next?: (err: Error) => any) => Promise<any>;
