export type Handler = (ctx: any, next?: NextFunction) => Promise<any>;

export type NextFunction = () => Promise<void>;
