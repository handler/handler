import { Handler } from './handler';

import { PATH_PREFIX } from './const';

export type PreHandlerFunction = (handler: Handler, ctx: any) => void;

export function composeHandlers(handlers: Handler[], preHandle?: PreHandlerFunction): Handler {
  return async (ctx, next) => {
    let lastIdx = -1;
    return dispatch(0);
    async function dispatch(i: number): Promise<any> {
      if (i <= lastIdx) {
        throw new Error('next() called multiple times');
      }
      lastIdx = i;
      let handler = handlers[i];
      if (i === handlers.length) {
        handler = next;
      }
      if (!handler) {
        return;
      }
      if (preHandle) {
        preHandle(handler, ctx);
      }
      return handler(ctx, async () => dispatch(i + 1));
    }
  };
}

export function removePrefix(path: string): string {
  if (PATH_PREFIX === '' || PATH_PREFIX === '/') {
    return path;
  }
  if (!path.startsWith(PATH_PREFIX)) {
    return null;
  }
  return path.slice(PATH_PREFIX.length);
}
