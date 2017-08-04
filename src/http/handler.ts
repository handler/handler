import { NextFunction } from '../handler';
import { HTTPContext } from './context';

export type HTTPHandler = (ctx: HTTPContext, next?: NextFunction) => Promise<any>;
