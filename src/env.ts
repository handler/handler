import { parseBoolean, parseString } from 'envutil';

export interface Env {
  handler: {
    debug: boolean;
    pathPrefix: string;
  };
  nodeEnv: string;
}

export const env: Env = {
  handler: {
    debug: parseBoolean('HANDLER_DEBUG'),
    pathPrefix: parseString('HANDLER_PATH_PREFIX'),
  },
  nodeEnv: parseString('NODE_ENV') || 'development',
};
