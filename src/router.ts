const pathMatch = require('path-match');

import { PATH_PREFIX } from './const';
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
    let result = path
      // Collapse repeated slashes
      .replace(/(\/+)/g, '/')
      // Remove trailing slash while preserving querystring
      .replace(/\/((?:\?.*)?)$/, '$1')
      // Ensure url starts with a slash
      .replace(/^([^/]|$)/, '/$1');
    // Handle non-empty path prefix case
    if (PATH_PREFIX !== '' && result === '/') {
      result = '';
    }
    if (result !== path) {
      return `${PATH_PREFIX}${result}`;
    }
    return null;
  }
}
