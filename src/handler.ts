import { FunctionHandler } from './function/handler';
import { HTTPHandler } from './http/handler';

export type Handler = FunctionHandler | HTTPHandler;
