import { NextFunction } from '../handler';
import { FunctionContext } from './context';

export type FunctionHandler = (ctx: FunctionContext, next?: NextFunction) => Promise<any>;
