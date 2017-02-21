import * as net from 'net';

const accepts = require('accepts');
import * as contentType from 'content-type';
const typeis = require('type-is');

import { HTTPContext } from './context';

const _accept = new WeakMap<HTTPRequest, any>();
const _body = new WeakMap<HTTPRequest, any>();
const _context = new WeakMap<HTTPRequest, HTTPContext>();
const _headers = new WeakMap<HTTPRequest, HTTPRequestHeaders>();
const _method = new WeakMap<HTTPRequest, string>();
const _params = new WeakMap<HTTPRequest, any>();
const _path = new WeakMap<HTTPRequest, string>();
const _proxy = new WeakMap<HTTPRequest, boolean>();
const _query = new WeakMap<HTTPRequest, any>();
const _subdomainOffset = new WeakMap<HTTPRequest, number>();
const _url = new WeakMap<HTTPRequest, string>();

export interface HTTPRequestHeaders {
  referer?: string;
  referrer?: string;
  [field: string]: string;
}

export interface HTTPRequestOptions {
  body: any;
  context: HTTPContext;
  headers: any;
  method: string;
  params: any;
  path: string;
  proxy: boolean;
  query: any;
  subdomainOffset: number;
}

export class HTTPRequest {
  constructor(options: HTTPRequestOptions) {
    _accept.set(this, accepts(this as any));
    _body.set(this, options.body);
    _context.set(this, options.context);
    _headers.set(this, options.headers || {});
    _method.set(this, options.method);
    _params.set(this, options.params || {});
    _path.set(this, options.path);
    _proxy.set(this, !!options.proxy);
    _query.set(this, options.query || {});
    _subdomainOffset.set(this, options.subdomainOffset || 0);
  }

  // Check if the given type(s) is acceptable, returning the best match when true, otherwise false.
  // The type value may be one or more mime type string such as "application/json",
  // the extension name such as "json", or an array ["json", "html", "text/plain"].
  //
  // You may call this.accepts() as many times as you like, or use a switch.
  accepts(...types: any[]): string | string[] | boolean {
    const accept = _accept.get(this);
    return accept.types.apply(accept, arguments);
  }

  // Check if charsets are acceptable, returning the best match when true, otherwise false.
  //
  // When no arguments are given all accepted charsets are returned as an array.
  acceptsCharsets(...charsets: any[]): string | string[] | boolean {
    const accept = _accept.get(this);
    return accept.charsets.apply(accept, arguments);
  }

  // Check if encodings are acceptable, returning the best match when true, otherwise false.
  // Note that you should include identity as one of the encodings!
  //
  // When no arguments are given all accepted encodings are returned as an array.
  //
  // Note that the identity encoding (which means no encoding) could be unacceptable if the client
  // explicitly sends identity;q=0.
  // Although this is an edge case, you should still handle the case where this method returns false.
  acceptsEncodings(...encodings: any[]): string | string[] | boolean {
    const accept = _accept.get(this);
    return accept.encodings.apply(accept, arguments);
  }

  // Check if langs are acceptable, returning the best match when true, otherwise false.
  //
  // When no arguments are given all accepted languages are returned as an array.
  acceptsLanguages(...langs: any[]): string | string[] | boolean {
    const accept = _accept.get(this);
    return accept.languages.apply(accept, arguments);
  }

  // Get body.
  get body(): any {
    return _body.get(this);
  }

  // Get request charset when present, or undefined.
  get charset(): string {
    const type = this.get('Content-Type');
    if (!type) {
      return '';
    }
    return contentType.parse(type).parameters.charset || '';
  }

  // Return request header.
  get(field: string): string {
    switch (field = field.toLowerCase()) {
      case 'referer':
      case 'referrer':
        return this.headers.referrer || this.headers.referer || '';
      default:
        return this.headers[field] || '';
    }
  }

  // Request header object. Alias as request.header.
  get headers(): HTTPRequestHeaders {
    return _headers.get(this);
  }

  // Get host (hostname:port) when present.
  // Supports X-Forwarded-Host when app.proxy is true, otherwise Host is used.
  get host(): string {
    const proxy = _proxy.get(this);
    let host = proxy && this.get('X-Forwarded-Host');
    host = host || this.get('Host');
    if (!host) {
      return '';
    }
    return host.split(/\s*,\s*/)[0];
  }

  // Get hostname when present.
  // Supports X-Forwarded-Host when app.proxy is true, otherwise Host is used.
  get hostname(): string {
    const host = this.host;
    if (!host) {
      return '';
    }
    return host.split(':')[0];
  }

  // Request remote address.
  // Supports X-Forwarded-For when app.proxy is true.
  get ip(): string {
    return this.ips[0] || '';
  }

  // When X-Forwarded-For is present and app.proxy is enabled an array of these ips is returned,
  // ordered from upstream -> downstream.
  // When disabled an empty array is returned.
  get ips(): string[] {
    const proxy = _proxy.get(this);
    const val = this.get('X-Forwarded-For');
    return proxy && (val ? val.split(/\s*,\s*/) : []);
  }

  // Check if the incoming request contains the "Content-Type" header field,
  // and it contains any of the give mime types.
  // If there is no request body, null is returned.
  // If there is no content type, or the match fails false is returned.
  // Otherwise, it returns the matching content-type.
  is(types: string[]): boolean {
    if (!types) {
      return typeis(this);
    }
    if (!Array.isArray(types)) {
      types = [].slice.call(arguments);
    }
    return typeis(this, types);
  }

  // Return request Content-Length as a number when present, or undefined.
  get length(): number {
    const len = this.get('Content-Length');
    if (len === '') {
      return;
    }
    return +len;
  }

  get method(): string {
    return _method.get(this);
  }

  set method(value: string) {
    _method.set(this, value);
  }

  get path(): string {
    return _path.get(this);
  }

  // Return request protocol, "https" or "http".
  // Supports X-Forwarded-Proto when app.proxy is true.
  get protocol(): string {
    const proxy = _proxy.get(this);
    if (!proxy) {
      return 'http';
    }
    const proto = this.get('X-Forwarded-Proto') || 'http';
    return proto.split(/\s*,\s*/)[0];
  }

  get query(): any {
    return _query.get(this);
  }

  // Shorthand for this.protocol == "https" to check if a request was issued via TLS.
  get secure(): boolean {
    return 'https' === this.protocol;
  }

  // Return subdomains as an array.
  //
  // Subdomains are the dot-separated parts of the host before the main domain of the app.
  // By default, the domain of the app is assumed to be the last two parts of the host.
  // This can be changed by setting app.subdomainOffset.
  //
  // For example,
  //   * If the domain is "tobi.ferrets.example.com":
  //   * If app.subdomainOffset is not set, this.subdomains is ["ferrets", "tobi"].
  //   * If app.subdomainOffset is 3, this.subdomains is ["tobi"]
  get subdomains(): string[] {
    const offset = _subdomainOffset.get(this);
    const hostname = this.hostname;
    if (net.isIP(hostname)) {
      return [];
    }
    return hostname
      .split('.')
      .reverse()
      .slice(offset);
  }

  // Get request Content-Type void of parameters such as "charset".
  get type(): string {
    const type = this.get('Content-Type');
    if (!type) {
      return '';
    }
    return type.split(';')[0];
  }

  // Get request URL.
  get url(): string {
    return _url.get(this);
  }

  // Set request URL, useful for url rewrites.
  set url(value: string) {
    _url.set(this, value);
  }

  // Inspect implementation.
  get inspect(): any {
    return this.toJSON();
  }

  // Return JSON representation.
  toJSON(): any {
    return {
      headers: this.headers,
      method: this.method,
      url: this.url,
    };
  }
}
