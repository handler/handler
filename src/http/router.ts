import { Router } from '../router';
import { composeHandlers, removePrefix } from '../util';
import { HTTPContext, HTTPContextOptions } from './context';
import { HTTPHandler } from './handler';

export interface HTTPRouteMatch {
  handler: HTTPHandler;
  params: {};
}

export class HTTPRouter extends Router {
  use(handler: HTTPHandler): HTTPRouter {
    this._middlewares.push(handler);
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

  async run(options: HTTPContextOptions): Promise<HTTPContext> {
    const ctx = new HTTPContext(options);

    const rewritePath = this._rewritePath(options.path);
    if (rewritePath) {
      ctx.res.redirect(rewritePath);
      return ctx;
    }

    const matches = this._matchRoute(options.method, options.path);
    const matchedHandlers = matches.map((match) => match.handler);
    const handlers = this._middlewares.concat(matchedHandlers);

    const preHandle = async (h: HTTPHandler, c: HTTPContext) => {
      for (const match of matches) {
        if (match.handler !== h) {
          continue;
        }
        c.req.params = match.params;
        break;
      }
    };

    await composeHandlers(handlers, preHandle)(ctx);

    return ctx;
  }

  protected _matchRoute(method: string, path: string): HTTPRouteMatch[] {
    path = removePrefix(path);
    if (path === null) {
      return null;
    }
    const result: HTTPRouteMatch[] = [];
    for (const route of this._routes) {
      const params = route.match(path);
      if (!params) {
        continue;
      }
      if (method && route.method && (method !== route.method)) {
        continue;
      }
      result.push({
        handler: route.handler as HTTPHandler,
        params: params || {},
      });
    }
    return result;
  }
}
