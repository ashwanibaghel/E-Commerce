import { normalizePort } from '../../bin/lib/normalizePort.js';
import { getConfig } from './getConfig.js';

export function getBaseUrl(): string {
  const envBaseUrl =
    process.env.APP_URL ||
    process.env.RENDER_EXTERNAL_URL ||
    (process.env.RENDER_EXTERNAL_HOSTNAME
      ? `https://${process.env.RENDER_EXTERNAL_HOSTNAME}`
      : '');
  if (envBaseUrl) {
    return envBaseUrl.replace(/\/+$/, '');
  }

  const port = normalizePort();
  const baseUrl = getConfig('shop.homeUrl', `http://localhost:${port}`);
  return baseUrl.replace(/\/+$/, ''); // Remove trailing slashes
}
