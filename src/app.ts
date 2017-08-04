const pathMatch = require('path-match');

import { PATH_PREFIX } from './const';
import { Handler } from './handler';
import { removePrefix } from './util';

const _createMatch = pathMatch();

export type RoutePath = string | RegExp | Array<string | RegExp>;

export interface Route {
  path: RoutePath;
  handler: Handler;
  match: any;
  method?: string;
}

export abstract class Application {
  protected _middlewares: Handler[] = [];
  protected _routes: Route[] = [];

  protected _addRoute(method: string, path: RoutePath, handler: Handler) {
    const route: Route = {
      handler,
      match: _createMatch(path),
      method,
      path,
    };
    this._routes.push(route);
  }

  protected _rewritePath(path: string): string {
    path = removePrefix(path);
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
