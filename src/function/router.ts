import { Router } from '../router';
import { composeHandlers, removePrefix } from '../util';
import { FunctionContext, FunctionContextOptions } from './context';
import { FunctionHandler } from './handler';

export interface FunctionRouteMatch {
  handler: FunctionHandler;
  params: {};
}

export class FunctionRouter extends Router {
  use(handler: FunctionHandler): FunctionRouter {
    this._middlewares.push(handler);
    return this;
  }

  all(path: string, handler: FunctionHandler): FunctionRouter {
    this._addRoute(null, path, handler);
    return this;
  }

  async run(options: FunctionContextOptions): Promise<any> {
    const ctx = new FunctionContext(options);

    const matches = this._matchRoute(options.path);
    const matchedHandlers = matches.map((match) => match.handler);
    const handlers = this._middlewares.concat(matchedHandlers);

    await composeHandlers(handlers)(ctx);

    return ctx;
  }

  protected _matchRoute(path: string): FunctionRouteMatch[] {
    path = removePrefix(path);
    if (path === null) {
      return null;
    }
    const result: FunctionRouteMatch[] = [];
    for (const route of this._routes) {
      const params = route.match(path);
      if (params) {
        continue;
      }
      result.push({
        handler: route.handler as FunctionHandler,
        params: params || {},
      });
    }
    return result;
  }
}
