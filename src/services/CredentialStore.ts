import { EnvsecClient } from '@envsec/sdk';

const CONTEXT = 'libretui';

export type Credentials = {
  readonly email: string;
  readonly password: string;
};

export async function saveCredentials(creds: Credentials): Promise<void> {
  const client = await EnvsecClient.create({ context: CONTEXT });
  try {
    await client.set('credentials.email', creds.email);
    await client.set('credentials.password', creds.password);
  } finally {
    await client.close();
  }
}

export async function loadCredentials(): Promise<Credentials | null> {
  const client = await EnvsecClient.create({ context: CONTEXT });
  try {
    const email = await client.get('credentials.email');
    const password = await client.get('credentials.password');

    if (!email || !password) {
      return null;
    }
    return { email, password };
  } finally {
    await client.close();
  }
}

export async function clearCredentials(): Promise<void> {
  const client = await EnvsecClient.create({ context: CONTEXT });
  try {
    await client.delete('credentials.email');
    await client.delete('credentials.password');
  } finally {
    await client.close();
  }
}
