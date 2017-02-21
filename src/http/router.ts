import { Route, Router } from '../router';
import { HTTPHandler } from './handler';

export interface HTTPRouteMatch {
  handler: HTTPHandler;
  params: {};
}

export class HTTPRouter extends Router {
  use(handler: HTTPHandler): HTTPRouter {
    this.middlewares.push(handler);
    return this;
  }

  all(path: string, handler: HTTPHandler): HTTPRouter {
    this._addRoute(null, path, handler);
    return this;
  }

  delete(path: string, handler: HTTPHandler): HTTPRouter {
    this._addRoute('DELETE', path, handler);
    return this;
  }

  get(path: string, handler: HTTPHandler): HTTPRouter {
    this._addRoute('GET', path, handler);
    return this;
  }

  head(path: string, handler: HTTPHandler): HTTPRouter {
    this._addRoute('HEAD', path, handler);
    return this;
  }

  options(path: string, handler: HTTPHandler): HTTPRouter {
    this._addRoute('OPTIONS', path, handler);
    return this;
  }

  patch(path: string, handler: HTTPHandler): HTTPRouter {
    this._addRoute('PATCH', path, handler);
    return this;
  }

  post(path: string, handler: HTTPHandler): HTTPRouter {
    this._addRoute('POST', path, handler);
    return this;
  }

  put(path: string, handler: HTTPHandler): HTTPRouter {
    this._addRoute('PUT', path, handler);
    return this;
  }

  matchRoute(method: string, path: string): HTTPRouteMatch {
    path = this._removePrefix(path);
    if (path === null) {
      return null;
    }
    for (const route of this.routes) {
      const params = route.match(path);
      if (!params) {
        continue;
      }
      if (method && route.method && (method !== route.method)) {
        continue;
      }
      return {
        handler: route.handler as HTTPHandler,
        params: params || {},
      };
    }
    return null;
  }
}
