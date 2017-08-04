import { Application, RoutePath } from '../app';
import { NextFunction } from '../handler';
import { composeHandlers, removePrefix } from '../util';
import { HTTPContext, HTTPContextOptions } from './context';
import { HTTPHandler } from './handler';

export interface HTTPRouteMatch {
  handler: HTTPHandler;
  params: {};
}

export class HTTPApplication extends Application {
  use(handler: HTTPHandler): HTTPApplication {
    this._middlewares.push(handler);
    return this;
  }

  all(path: RoutePath, ...handlers: HTTPHandler[]): HTTPApplication {
    for (const handler of handlers) {
      this._addRoute(null, path, handler);
    }
    return this;
  }

  delete(path: RoutePath, ...handlers: HTTPHandler[]): HTTPApplication {
    for (const handler of handlers) {
      this._addRoute('DELETE', path, handler);
    }
    return this;
  }

  get(path: RoutePath, ...handlers: HTTPHandler[]): HTTPApplication {
    for (const handler of handlers) {
      this._addRoute('GET', path, handler);
    }
    return this;
  }

  head(path: RoutePath, ...handlers: HTTPHandler[]): HTTPApplication {
    for (const handler of handlers) {
      this._addRoute('HEAD', path, handler);
    }
    return this;
  }

  options(path: RoutePath, ...handlers: HTTPHandler[]): HTTPApplication {
    for (const handler of handlers) {
      this._addRoute('OPTIONS', path, handler);
    }
    return this;
  }

  patch(path: RoutePath, ...handlers: HTTPHandler[]): HTTPApplication {
    for (const handler of handlers) {
      this._addRoute('PATCH', path, handler);
    }
    return this;
  }

  post(path: RoutePath, ...handlers: HTTPHandler[]): HTTPApplication {
    for (const handler of handlers) {
      this._addRoute('POST', path, handler);
    }
    return this;
  }

  put(path: RoutePath, ...handlers: HTTPHandler[]): HTTPApplication {
    for (const handler of handlers) {
      this._addRoute('PUT', path, handler);
    }
    return this;
  }

  async run(options: HTTPContextOptions): Promise<HTTPContext> {
    const ctx = new HTTPContext(options);

    const rewritePath = this._rewritePath(options.path);
    if (rewritePath) {
      ctx.res.redirect(rewritePath);
      return ctx;
    }

    const middlewares = [_defaultErrorHandler].concat(this._middlewares);
    const matches = this._matchRoute(options.method, options.path);
    const matchedHandlers = matches.map((match) => match.handler);
    const handlers = middlewares.concat(matchedHandlers);

    const preHandle = async (h: HTTPHandler, c: HTTPContext) => {
      for (const match of matches) {
        if (match.handler === h) {
          c.req.params = match.params;
          break;
        }
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

async function _defaultErrorHandler(ctx: HTTPContext, next: NextFunction) {
  try {
    await next();
  } catch (err) {
    ctx.res.status = err.statusCode || err.status || 500;
    ctx.res.body = {
      message: err.message,
    };
  }
}
