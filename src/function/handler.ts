import { FunctionRequest } from './request';

export type FunctionHandler = (req: FunctionRequest, next?: () => Promise<any>) => Promise<any>;
