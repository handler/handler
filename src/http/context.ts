import * as httpAssert from 'http-assert';
import * as httpErrors from 'http-errors';

import { HTTPRequestHeaders } from './header';
import { HTTPRequest } from './request';
import { HTTPResponse } from './response';

const _request = new WeakMap<HTTPContext, HTTPRequest>();
const _response = new WeakMap<HTTPContext, HTTPResponse>();

export interface HTTPContextOptions {
  body: any;
  context?: any;
  headers?: any;
  method: string;
  params?: any;
  path: string;
  proxy?: boolean;
  query?: any;
  subdomainOffset?: number;
}

export class HTTPContext {
  constructor(options: HTTPContextOptions) {
    const req = new HTTPRequest({
      body: options.body,
      context: this,
      headers: options.headers,
      method: options.method,
      params: options.params,
      path: options.path,
      proxy: options.proxy,
      query: options.query,
      subdomainOffset: options.subdomainOffset,
    });
    _request.set(this, req);

    const res = new HTTPResponse({
      context: this,
    });
    _response.set(this, res);
  }

  get req(): HTTPRequest {
    return _request.get(this);
  }

  get res(): HTTPResponse {
    return _response.get(this);
  }

  // Request delegates
  accepts(...types: any[]): string | string[] | boolean {
    return this.req.accepts(...types);
  }
  acceptsCharsets(...charsets: any[]): string | string[] | boolean {
    return this.req.acceptsCharsets(...charsets);
  }
  acceptsEncodings(...encodings: any[]): string | string[] | boolean {
    return this.req.acceptsEncodings(...encodings);
  }
  acceptsLanguages(...langs: any[]): string | string[] | boolean {
    return this.req.acceptsLanguages(...langs);
  }
  get(field: string): string {
    return this.req.get(field);
  }
  get headers(): HTTPRequestHeaders {
    return this.req.headers;
  }
  get host(): string {
    return this.req.host;
  }
  get hostname(): string {
    return this.req.hostname;
  }
  get ip(): string {
    return this.req.ip;
  }
  get ips(): string[] {
    return this.req.ips;
  }
  is(types: string[]): boolean {
    return this.req.is(types);
  }
  get method(): string {
    return this.req.method;
  }
  set method(value: string) {
    this.req.method = value;
  }
  get params(): any {
    return this.req.params;
  }
  set params(value: any) {
    this.req.params = value;
  }
  get path(): string {
    return this.req.path;
  }
  get protocol(): string {
    return this.req.protocol;
  }
  get query(): any {
    return this.req.query;
  }
  get secure(): boolean {
    return this.req.secure;
  }
  get subdomains(): string[] {
    return this.req.subdomains;
  }
  get url(): string {
    return this.req.url;
  }
  set url(value: string) {
    this.req.url = value;
  }

  // Response delegates
  append(field: string, values: string | string[]): void {
    return this.res.append(field, values);
  }
  get body(): any {
    return this.res.body;
  }
  set body(value: any) {
    this.res.body = value;
  }
  redirect(url: string, alt?: string): void {
    return this.res.redirect(url, alt);
  }
  remove(field: string) {
    return this.res.remove(field);
  }
  set(field: string, value: string): void {
    return this.res.set(field, value);
  }
  get status(): number {
    return this.res.status;
  }
  set status(code: number) {
    this.res.status = code;
  }
  get type(): string {
    return this.res.type;
  }
  set type(value: string) {
    this.res.type = value;
  }

  // Similar to .throw(), adds assertion.
  assert(value: boolean, msg: string, status: number = 500): void {
    httpAssert(value, status, msg);
  }

  // Throw an error with `msg` and optional `status` defaulting to 500.
  // Note that these are user-level errors, and the message may be exposed to the client.
  throw(msg: string, status: number = 500): void {
    throw httpErrors(status, msg);
  }

  // util.inspect() implementation, which just returns the JSON output.
  inspect() {
    return this.toJSON();
  }

  // Return JSON representation.
  //
  // Here we explicitly invoke .toJSON() on each object, as iteration will otherwise fail due
  // to the getters and cause utilities such as clone() to fail.
  toJSON() {
    return {
      path: this.req.path,
      req: this.req.toJSON(),
      res: this.res.toJSON(),
    };
  }
}
