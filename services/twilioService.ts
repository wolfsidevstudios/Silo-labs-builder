const TWILIO_ACCOUNT_SID_KEY = 'twilio_account_sid';
const TWILIO_AUTH_TOKEN_KEY = 'twilio_auth_token';

interface TwilioCredentials {
  accountSid: string;
  authToken: string;
}

export function saveCredentials(creds: TwilioCredentials): void {
  localStorage.setItem(TWILIO_ACCOUNT_SID_KEY, creds.accountSid);
  localStorage.setItem(TWILIO_AUTH_TOKEN_KEY, creds.authToken);
}

export function getCredentials(): TwilioCredentials | null {
  const accountSid = localStorage.getItem(TWILIO_ACCOUNT_SID_KEY);
  const authToken = localStorage.getItem(TWILIO_AUTH_TOKEN_KEY);
  if (accountSid && authToken) {
    return { accountSid, authToken };
  }
  return null;
}

export function removeCredentials(): void {
  localStorage.removeItem(TWILIO_ACCOUNT_SID_KEY);
  localStorage.removeItem(TWILIO_AUTH_TOKEN_KEY);
}