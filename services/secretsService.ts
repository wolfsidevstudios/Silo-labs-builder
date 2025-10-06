import { Secret } from '../types';

const SECRETS_STORAGE_KEY = 'ai_react_app_builder_secrets';

export function getSecrets(): Secret[] {
  try {
    const secretsJson = localStorage.getItem(SECRETS_STORAGE_KEY);
    return secretsJson ? JSON.parse(secretsJson) : [];
  } catch (error) {
    console.error("Failed to parse secrets from localStorage", error);
    localStorage.removeItem(SECRETS_STORAGE_KEY);
    return [];
  }
}

export function addSecret(secret: Secret): void {
  const secrets = getSecrets();
  if (secrets.some(s => s.name === secret.name)) {
    throw new Error(`A secret with the name "${secret.name}" already exists.`);
  }
  const updatedSecrets = [...secrets, secret];
  localStorage.setItem(SECRETS_STORAGE_KEY, JSON.stringify(updatedSecrets));
}

export function removeSecret(secretName: string): void {
  const secrets = getSecrets();
  const updatedSecrets = secrets.filter(s => s.name !== secretName);
  localStorage.setItem(SECRETS_STORAGE_KEY, JSON.stringify(updatedSecrets));
}
