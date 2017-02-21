import { Route, Router } from '../router';
import { FunctionHandler } from './handler';

export interface FunctionRouteMatch {
  handler: FunctionHandler;
  params: {};
}

export class FunctionRouter extends Router {
  use(handler: FunctionHandler): FunctionRouter {
    this.middlewares.push(handler);
    return this;
  }

  all(path: string, handler: FunctionHandler): FunctionRouter {
    this._addRoute(null, path, handler);
    return this;
  }

  matchRoute(path: string): FunctionRouteMatch {
    path = this._removePrefix(path);
    if (path === null) {
      return null;
    }
    for (const route of this.routes) {
      const params = route.match(path);
      if (!params) {
        continue;
      }
      return {
        handler: route.handler as FunctionHandler,
        params: params || {},
      };
    }
    return null;
  }
}
