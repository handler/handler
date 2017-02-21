import * as escape from 'escape-html';
import { isString } from 'lodash';
import * as statuses from 'statuses';

import { HTTPContext } from './context';

const _body = new WeakMap<HTTPResponse, any>();
const _context = new WeakMap<HTTPResponse, HTTPContext>();
const _headers = new WeakMap<HTTPResponse, HTTPResponseHeaders>();
const _status = new WeakMap<HTTPResponse, number>();
const _type = new WeakMap<HTTPResponse, string>();

export interface HTTPResponseHeaders {
  [field: string]: string[];
}

export interface HTTPResponseOptions {
  context: HTTPContext;
}

export class HTTPResponse {
  constructor(options: HTTPResponseOptions) {
    _context.set(this, options.context);
    _headers.set(this, {});
  }

  append(field: string, values: string | string[]): void {
    if (isString(values)) {
      values = [values];
    }
    if (!this.headers[field]) {
      this.headers[field] = [];
    }
    this.headers[field] = this.headers[field].concat(values);
  }

  get body(): any {
    return _body.get(this);
  }

  set body(value: any) {
    _body.set(this, value);
  }

  get headers(): HTTPResponseHeaders {
    return _headers.get(this);
  }

  get(field: string): string {
    return this.headers[field][0];
  }

  // Perform a [302] redirect to url.
  // The string "back" is special-cased to provide Referrer support,
  // when Referrer is not present alt or "/" is used.
  //
  // To alter the default status of 302, simply assign the status before or after this call.
  // To alter the body, assign it after this call.
  redirect(url: string, alt?: string): void {
    const ctx = _context.get(this);
    // location
    if ('back' === url) {
      url = ctx.req.get('Referrer') || alt || '/';
    }
    this.set('Location', url);
    // status
    if (!statuses.redirect[this.status]) {
      this.status = 302;
    }
    // html
    if (ctx.req.accepts('html')) {
      url = escape(url);
      this.type = 'text/html; charset=utf-8';
      this.body = `Redirecting to <a href="${url}">${url}</a>.`;
      return;
    }
    // text
    this.type = 'text/plain; charset=utf-8';
    this.body = `Redirecting to ${url}.`;
  }

  remove(field: string) {
    delete this.headers[field];
  }

  set(field: string, value: string): void {
    this.headers[field] = [value];
  }

  get status(): number {
    return _status.get(this);
  }

  set status(code: number) {
    _status.set(this, code);
  }

  get type(): string {
    return _type.get(this);
  }

  set type(value: string) {
    _type.set(this, value);
  }

  // Inspect implementation.
  inspect(): any {
    const o = this.toJSON();
    o.body = this.body;
    return o;
  }

  // Return JSON representation.
  toJSON(): any {
    return {
      headers: this.headers,
      status: this.status,
    };
  }
}
