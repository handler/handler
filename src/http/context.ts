import * as net from 'net';

import * as httpAssert from 'http-assert';
import * as httpErrors from 'http-errors';

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
