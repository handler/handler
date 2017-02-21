import { env } from './env';

export function debug(value: any, title?: string) {
  if (!env.handler.debug) { return; }
  let result = JSON.stringify(value, null, 2);
  if (title) {
    result = `${title}: ${result}`;
  }
  console.log(result);
}
