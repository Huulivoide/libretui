import { LibreLinkClient, GlucoseReading } from 'libre-link-unofficial-api';
import { type Server } from '../state/AppState.js';

const lluVersion = '4.17.0';

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

export function logout(): void {
  client = null;
}

/**
 * Fetch a single API response and return merged historical + latest readings.
 * The latest glucoseItem is appended to the graphData array only if its
 * timestamp is strictly newer than the last historical reading.
 */
export async function fetchReadings(): Promise<ReadonlyArray<GlucoseReading>> {
  const response = await getClient().fetchReading();
  const connection = response.data.connection;
  const readings = response.data.graphData.map(
    (item) => new GlucoseReading(item, connection),
  );
  const latest = new GlucoseReading(connection.glucoseItem, connection);
  const lastHistorical = readings.at(-1);
  if (!lastHistorical || latest.timestamp > lastHistorical.timestamp) {
    return [...readings, latest];
  }
  return readings;
}
