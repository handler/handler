const _body = new WeakMap<FunctionRequest, any>();
const _context = new WeakMap<FunctionRequest, any>();
const _path = new WeakMap<FunctionRequest, string>();

export interface FunctionRequestOptions {
  body: any;
  context?: any;
  path?: string;
}

export class FunctionRequest {
  constructor(options: FunctionRequestOptions) {
    _body.set(this, options.body);
    _context.set(this, options.context);
    _path.set(this, options.path);
  }

  get body(): any {
    return _body.get(this);
  }

  get context(): any {
    return _context.get(this);
  }

  get path(): string {
    return _path.get(this);
  }
}
