import pino from 'pino'
import { env, isProd } from './env'

export const logger = pino({
  level: env.LOG_LEVEL,
  redact: { paths: ['req.headers.cookie', 'req.headers.authorization'], remove: true },
  ...(isProd
    ? {}
    : {
        transport: {
          target: 'pino-pretty',
          options: { colorize: true, translateTime: 'HH:MM:ss' },
        },
      }),
})
