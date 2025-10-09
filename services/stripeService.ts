const STRIPE_SECRET_KEY = 'stripe_secret_key';
const STRIPE_PUBLISHABLE_KEY = 'stripe_publishable_key';

interface StripeKeys {
  secretKey: string;
  publishableKey: string;
}

export function saveApiKeys(keys: StripeKeys): void {
  localStorage.setItem(STRIPE_SECRET_KEY, keys.secretKey);
  localStorage.setItem(STRIPE_PUBLISHABLE_KEY, keys.publishableKey);
}

export function getApiKeys(): StripeKeys | null {
  const secretKey = localStorage.getItem(STRIPE_SECRET_KEY);
  const publishableKey = localStorage.getItem(STRIPE_PUBLISHABLE_KEY);
  if (secretKey && publishableKey) {
    return { secretKey, publishableKey };
  }
  return null;
}

export function removeApiKeys(): void {
  localStorage.removeItem(STRIPE_SECRET_KEY);
  localStorage.removeItem(STRIPE_PUBLISHABLE_KEY);
}
