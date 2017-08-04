const _body = new WeakMap<FunctionContext, any>();
const _context = new WeakMap<FunctionContext, any>();
const _path = new WeakMap<FunctionContext, string>();

export interface FunctionContextOptions {
  body: any;
  context?: any;
  path?: string;
}

export class FunctionContext {
  constructor(options: FunctionContextOptions) {
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
