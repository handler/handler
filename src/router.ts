const pathMatch = require('path-match');

import { PATH_PREFIX } from './const';
import { env } from './env';
import { Handler } from './handler';

const _createMatch = pathMatch();

export interface Route {
  path: string;
  handler: Handler;
  match: any;
  method?: string;
}

export abstract class Router {
  middlewares: Handler[] = [];
  routes: Route[] = [];

  _addRoute(method: string, path: string, handler: Handler) {
    const route = {
      handler,
      path,
      match: _createMatch(path),
      method,
    };
    this.routes.push(route);
  }

  _removePrefix(path: string): string {
    if (PATH_PREFIX === '' || PATH_PREFIX === '/') {
      return path;
    }
    if (!path.startsWith(PATH_PREFIX)) {
      return null;
    }
    return path.slice(PATH_PREFIX.length);
  }

  _rewritePath(path: string): string {
    path = this._removePrefix(path);
    const result = path
      // collapse repeated slashes
      .replace(/(\/+)/g, '/')
      // remove trailing slash while preserving querystring
      .replace(/\/((?:\?.*)?)$/, '$1')
      // ensure url starts with a slash
      .replace(/^([^/]|$)/, '/$1');
    if (result !== path && result !== '/') {
      return `${PATH_PREFIX}${result}`;
    }
    return null;
  }
}
