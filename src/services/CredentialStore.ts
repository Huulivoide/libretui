import { EnvsecClient } from '@envsec/sdk';

const CONTEXT = 'libretui';

export interface Credentials {
  email: string;
  password: string;
  server: string;
}

export async function saveCredentials(creds: Credentials): Promise<void> {
  const client = await EnvsecClient.create({ context: CONTEXT });
  try {
    await client.set('credentials.email', creds.email);
    await client.set('credentials.password', creds.password);
    await client.set('credentials.server', creds.server);
  } finally {
    await client.close();
  }
}

export async function loadCredentials(): Promise<Credentials | null> {
  const client = await EnvsecClient.create({ context: CONTEXT });
  try {
    const email = await client.get('credentials.email');
    const password = await client.get('credentials.password');
    const server = await client.get('credentials.server');

    if (!email || !password || !server) return null;
    return { email, password, server };
  } finally {
    await client.close();
  }
}

export async function clearCredentials(): Promise<void> {
  const client = await EnvsecClient.create({ context: CONTEXT });
  try {
    await client.delete('credentials.email');
    await client.delete('credentials.password');
    await client.delete('credentials.server');
  } finally {
    await client.close();
  }
}
