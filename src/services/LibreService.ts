import {
  LibreLinkClient,
  type GlucoseReading,
} from 'libre-link-unofficial-api';
import { type Server } from '../state/AppState.js';

const lluVersion = '4.17.0'

let client: LibreLinkClient | null = null;

/**
 * Log in and initialise the internal client.
 * Must be called before read(), history(), or stream().
 * Sets LIBRE_LINK_API_URL before constructing the client so
 * the library picks up the correct region.
 */
export async function login(
  email: string,
  password: string,
  server: Server,
): Promise<void> {
  process.env.LIBRE_LINK_API_URL = server;
  client = new LibreLinkClient({ email, password, lluVersion });
  await client.login();
}

function getClient(): LibreLinkClient {
  if (!client) {
    throw new Error('LibreService: not logged in');
  }
  return client;
}

/** Fetch the latest single glucose reading */
export async function read(): Promise<GlucoseReading> {
  return getClient().read();
}

/** Fetch historical graph data */
export async function history(): Promise<Array<GlucoseReading>> {
  return getClient().history();
}

/** Stream readings at the given interval (default 90 s) */
export function stream(
  intervalMs?: number,
): AsyncGenerator<GlucoseReading, void, unknown> {
  return getClient().stream(intervalMs);
}

export function logout(): void {
  client = null;
}
